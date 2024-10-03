import { Strategy } from 'passport-strategy'
import { prisma } from '@ima/server/db'
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
      return this.fail(err, 422)
    }
  }

  async auth(req: Parameters<Strategy['authenticate']>[0]) {
    const parsed = this.parse(req)
    if (!parsed) return this.fail('invalid_request', 400)

    const { scopes } = this.options
    const { domain, baseUrl, redirectUri } = parsed

    try {
      const type = await this.detect(baseUrl)
      if (type !== 'mastodon') return this.fail('not_supported', 422)

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
          this.error(new Error('No URL'))
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) this.error(err)
    }
  }

  async callback(req: Parameters<Strategy['authenticate']>[0]) {
    const parsed = this.parse(req)
    if (!parsed) return this.fail('invalid_request', 400)

    const { domain, code, baseUrl, redirectUri } = parsed
    if (!code) return this.fail('invalid_request', 400)

    try {
      const app = await prisma.fediverseApp.findFirst({ where: { domain } })
      if (!app) return this.fail('invalid_request', 400)

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
      if (err instanceof Error) this.error(err)
    }
  }
}

export default FediverseStrategy
