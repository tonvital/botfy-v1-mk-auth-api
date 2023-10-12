node -v | grep "v16"
if [ $? -eq 0 ]
then
  echo "NodeJS V16 já instalado."
else
  echo "Instalando NodeJS..."
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  NODE_MAJOR=16
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
  sudo apt-get update -y
  sudo apt-get install nodejs -y
  echo "Terminado node js!"
fi

pm2 -v
if [ $? -eq 0 ]
then
  echo "PM2 já instalado!"
else
  echo "Instalando pm2..."
  npm install pm2@latest -g
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 50M
  pm2 set pm2-logrotate:retain 10
  pm2 set pm2-logrotate:compress true
  echo "Terminado pm2!"
fi

echo "Baixando nova API..."
rm -rf botfy-v1-mk-auth-api-main/
rm -rf botfy-v1-mk-auth-api-main
rm -rf botfy-v1-mk-auth-api
rm -rf botfy-v1-mk-auth-api.zip
wget --no-check-certificate -O botfy-v1-mk-auth-api.zip https://github.com/tonvital/botfy-v1-mk-auth-api/archive/main.zip && unzip -o botfy-v1-mk-auth-api.zip
clear
cd botfy-v1-mk-auth-api-main
echo "Instalando API..."
npm install
clear
pm2 stop api
pm2 delete api
pm2 start pm2-run.json --exp-backoff-restart-delay=100
pm2 save
pm2 startup

clear
echo "Checando API..."
sleep 5

curl -Is http://localhost:9657/botfy-v1-mk-auth?f=heathCheck | grep "200"

if [ $? -eq 0 ]
then
echo "API botfy-mk-auth foi instalada com sucesso!"
else
echo "Oops! Algo deu errado na instalação!!!"
fi
