import { Strategy } from 'passport-strategy'
import prisma from '@ima/server/stores/prisma'
import generator, { detector, Mastodon } from 'megalodon'

interface FediverseStrategyOptions {
  redirectUrl: string
  callbackPath: string
  scopes: string[]
}

class FediverseStrategy extends Strategy {
  constructor(private options: FediverseStrategyOptions) {
    super()
  }

  authenticate(req: Parameters<Strategy['authenticate']>[0]): void {
    if (req.query.code) {
      this.callback(req)
    } else {
      this.auth(req)
    }
  }

  cancel(message: string) {
    this.redirect(`${this.options.redirectUrl}/?error=${encodeURIComponent(message)}`)
  }

  parse(req: Parameters<Strategy['authenticate']>[0]) {
    const domain = req.query.domain || req.params.domain
    if (typeof domain !== 'string') return null

    const code = req.query.code
    if (typeof code !== 'string' && typeof code !== 'undefined') return null

    const { protocol, headers } = req
    const { callbackPath } = this.options

    return {
      domain,
      code,
      baseUrl: `https://${domain}`,
      redirectUri: `${protocol}://${headers.host}${callbackPath}/${domain}`,
    }
  }

  async detect(url: string) {
    try {
      return await detector(url)
    } catch (err: unknown) {
      return this.cancel(
        err instanceof Error
          ? err.message === 'Unknown SNS'
            ? '마스토돈 서버가 아닙니다.'
            : '서버에 연결할 수 없습니다.'
          : '오류가 발생했습니다.'
      )
    }
  }

  async auth(req: Parameters<Strategy['authenticate']>[0]) {
    const parsed = this.parse(req)
    if (!parsed) return this.cancel('잘못된 요청입니다.')

    const { scopes } = this.options
    const { domain, baseUrl, redirectUri } = parsed

    try {
      const type = await this.detect(baseUrl)
      if (type !== 'mastodon') return this.cancel(`마스토돈 서버가 아닙니다. (${type})`)

      const client = generator(type, baseUrl) as Mastodon
      const app = await prisma.fediverseApp.findFirst({ where: { domain } })

      if (app) {
        return this.redirect(
          await client.generateAuthUrl(app.clientId, app.clientSecret, { scope: scopes, redirect_uri: redirectUri })
        )
      } else {
        const result = await client.registerApp('IMA', { scopes, redirect_uris: redirectUri })
        await prisma.fediverseApp.create({
          data: { domain, clientId: result.client_id, clientSecret: result.client_secret },
        })

        if (result.url) {
          this.redirect(result.url)
        } else {
          this.cancel('앱 등록에 실패했습니다.')
        }
      }
    } catch (err: unknown) {
      this.cancel(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  async callback(req: Parameters<Strategy['authenticate']>[0]) {
    const parsed = this.parse(req)
    if (!parsed) return this.cancel('잘못된 요청입니다.')

    const { domain, code, baseUrl, redirectUri } = parsed
    if (!code) return this.cancel('인증 코드가 없습니다.')

    try {
      const app = await prisma.fediverseApp.findFirst({ where: { domain } })
      if (!app) return this.cancel('앱 정보가 없습니다.')

      const client = generator('mastodon', baseUrl) as Mastodon
      const result = await client.fetchAccessToken(app.clientId, app.clientSecret, code, redirectUri)

      const authClient = generator('mastodon', baseUrl, result.access_token) as Mastodon
      const { data } = await authClient.verifyAccountCredentials()

      const id = `${domain}:${data.id}`
      const displayName = data.display_name
      const username = data.username
      const token = result.refresh_token || ''
      const tokenSecret = result.access_token

      const user = await prisma.user.findFirst({ where: { id } })
      if (user) {
        this.success(await prisma.user.update({ where: { id }, data: { displayName, username, token, tokenSecret } }))
      } else {
        this.success(await prisma.user.create({ data: { id, displayName, username, token, tokenSecret } }))
      }
    } catch (err: unknown) {
      this.cancel(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }
}

export default FediverseStrategy
