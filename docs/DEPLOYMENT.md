# Deploying AskMore

Single-host production deployment for AskMore. The app runs as a
containerized Express server behind an nginx reverse proxy. SQLite
data is persisted in a named Docker volume.

## Prerequisites

- Docker 24+ and docker-compose 1.29+ (or `docker compose` v2)
- A Linux host with a public IP
- Ports 80/443 open in your firewall / cloud security group
- A DNS A record pointing to the host

## First-Time Setup

```bash
# 1. Clone
git clone https://github.com/ndng28/AskMore.git /opt/askmore
cd /opt/askmore

# 2. Build the image
docker build -t askmore:1.0.0 .

# 3. Configure environment
cp .env.example .env
# Edit .env — PORT stays 3000, DATA_DIR stays /app/data.
```

## Run with the Production Compose Override

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d
```

This brings up the container with:

- `restart: always` (auto-restart on host reboot or crash)
- named volume `askmore-data` for the SQLite database
- read-only root FS with `tmpfs` for the SQLite WAL
- dropped Linux capabilities, `no-new-privileges`
- json-file log rotation (3 × 10MB)
- 128MB memory / 0.5 CPU limit
- healthcheck on `/api/users` (the cheapest read endpoint)

Verify:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -sf http://127.0.0.1:8080/api/users && echo OK
```

The Node server should answer 200 with a JSON array. The container
binds only to loopback — the public listener is nginx.

## Front With nginx

Install nginx on the host, then symlink the config and reload:

```bash
sudo ln -s /opt/askmore/deploy/nginx/askmore.conf \
            /etc/nginx/sites-enabled/askmore.conf
sudo nginx -t
sudo systemctl reload nginx
```

At this point `http://<your-host>/` serves AskMore with security
headers (XCTO, XFO, Referrer-Policy, CSP) and 7-day immutable
caching for static assets.

## Add TLS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d askmore.example.com
```

Certbot edits the nginx config to redirect 80→443 and injects the
issued cert. After that, uncomment the HSTS line in
`deploy/nginx/askmore.conf` and reload nginx.

Certs renew automatically via the certbot systemd timer.

## Backups

The SQLite database lives in the `askmore-data` named volume. To
snapshot it without downtime:

```bash
docker compose exec -T askmore \
  sqlite3 /app/data/database.sqlite ".backup '/app/data/backup.sqlite'"
docker cp $(docker compose ps -q askmore):/app/data/backup.sqlite \
  ./backups/askmore-$(date +%F).sqlite
```

The `.backup` command is safe to run while the database is live
(it acquires the appropriate lock and writes a consistent copy).

## Upgrades

```bash
cd /opt/askmore
git pull
docker build -t askmore:1.1.0 .
# Edit docker-compose.prod.yml to bump the image tag (or rely on
# :latest if you re-tagged it). Then:
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d
```

The named volume survives container recreation, so the database is
preserved across upgrades.

## Observability

Logs are written to the json-file driver and rotated automatically:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=200
```

To ship to a central log sink, swap the `logging.driver` in
`docker-compose.prod.yml` to `syslog` or `fluentd` and configure
the corresponding endpoint.

## Uninstallation

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker volume rm askmore-data
```
