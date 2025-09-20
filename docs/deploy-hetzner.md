# Deploying AgroAI to Hetzner VPS

This guide explains how to deploy AgroAI to a Hetzner VPS using Docker Compose and GitHub Actions.

## Prerequisites

1. Hetzner VPS with:
   - Ubuntu 22.04 LTS
   - At least 2GB RAM
   - 20GB SSD
   - Docker and Docker Compose installed

2. GitHub repository secrets:
   - `VPS_SSH_KEY`: SSH private key for VPS access
   - `VPS_HOST`: VPS IP address or hostname
   - `VPS_USER`: SSH username (usually root)
   - `GHCR_TOKEN`: GitHub Container Registry token
   - `JWT_SECRET`: JWT signing secret
   - `DATABASE_URL`: PostgreSQL connection string

## Initial Setup

1. SSH into your VPS:
   ```bash
   ssh root@<VPS_IP>
   ```

2. Create application directory:
   ```bash
   mkdir -p /opt/agroai
   cd /opt/agroai
   ```

3. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   apt-get install -y docker-compose
   ```

4. Create required directories:
   ```bash
   mkdir -p nginx/conf.d
   mkdir -p certbot/conf
   mkdir -p certbot/www
   ```

## Deployment

The deployment is automated via GitHub Actions. When you push to the main branch:

1. GitHub Actions builds Docker images
2. Images are pushed to GitHub Container Registry
3. Actions deploys to VPS via SSH
4. Database migrations are run automatically

### Manual Deployment

If needed, you can deploy manually:

1. SSH into the VPS
2. Navigate to app directory:
   ```bash
   cd /opt/agroai
   ```

3. Pull and start services:
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. Run migrations:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend ./scripts/run_migrations.sh
   ```

## Verification

1. Check service health:
   ```bash
   curl http://<VPS_IP>/api/health
   ```

2. Verify frontend:
   ```bash
   curl http://<VPS_IP>/
   ```

3. Check logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Rollback

If deployment fails:

1. Roll back to previous version:
   ```bash
   # Get previous deployment SHA
   export GITHUB_SHA=<previous-sha>
   
   # Redeploy previous version
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. Check migration logs:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend cat /var/log/migrations.log
   ```

3. If needed, restore database from backup:
   ```bash
   # Restore latest backup
   docker-compose -f docker-compose.prod.yml exec db pg_restore -U agroai -d agroai /backups/latest.dump
   ```

## Monitoring

1. View service logs:
   ```bash
   # All services
   docker-compose -f docker-compose.prod.yml logs -f

   # Specific service
   docker-compose -f docker-compose.prod.yml logs -f backend
   ```

2. Check service health:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

3. Monitor resource usage:
   ```bash
   docker stats
   ```

## Troubleshooting

1. If services won't start:
   - Check logs: `docker-compose -f docker-compose.prod.yml logs`
   - Verify environment variables
   - Check disk space: `df -h`
   - Check Docker status: `systemctl status docker`

2. If migrations fail:
   - Check migration logs
   - Verify database connection
   - Check database permissions
   - Review migration files for errors

3. If frontend not accessible:
   - Check NGINX logs
   - Verify NGINX configuration
   - Check frontend container logs
   - Verify domain DNS settings
