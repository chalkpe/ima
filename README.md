# ima

![GitHub package.json version](https://img.shields.io/github/package-json/v/chalkpe/ima?style=for-the-badge) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/chalkpe/ima/docker.yml?style=for-the-badge) ![Website](https://img.shields.io/website?url=https%3A%2F%2Fima.chalk.moe&style=for-the-badge)

Two-player riichi mahjong (2인 리치 마작)

## Rule modifications

- Chii enabled (치 가능)
- No nukidora (북빼기 없음)
- No manzu, pinzu simples (만수, 통수 중장패 없음)

## Features

- Local yaku (로컬 역)
- Mangan shibari (만관 판수묶음)
- Transparent tiles (투명패)

## Local yaku list

### Double yakuman

- Daisuurin (대수린)
- Daisharin (대차륜)
- Daichikurin (대죽림)
- Daichisei (대칠성)

### Yakuman

- Renhou (인화)
- Ishinouenimosannen (석상삼년)
- Isshokuyonjun (일색사순)

### Mangan

- Iipin mouyue (일통모월)
- Chuupin raoyui (구통노어)

### 2-han

- Uumensai (오문제)
- Sanrenkou (삼연각)
- Isshokusanjun (일색삼순)

### 1-han

- Kanfuri (깡후리)
- Tsubamegaeshi (츠바메가에시)
- Shiiaruraotai (십이낙태)

## Development

### Requirements

- Node.js v22
- Docker Compose v2
- [Twitter application key](https://developer.x.com/apps)

### Install

```sh
### Clone repository
git clone https://github.com/chalkpe/ima && cd ima

### Copy env file for dev servers
cp server/.env.example server/.env
vim server/.env # Update TWITTER_API_KEY, TWITTER_API_SECRET

### Copy env file for production build
cp server/.env.local.example server/.env.local
vim server/.env.local # Update TWITTER_API_KEY, TWITTER_API_SECRET
```

### Run dev servers

```sh
### Run valkey and postgres (or run manually)
docker run -d --name valkey -p 6379:6379 --rm valkey/valkey:8.0
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password --rm postgres:14

### Init project and sync db
npm install
npm run prestart -w server

### Run dev servers
npm run dev -w client
npm run dev -w server
```

### Run production build

```sh
docker compose up --build
```

## License

[MIT License](LICENSE)
