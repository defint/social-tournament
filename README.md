# Social tournament service

## Dependencies

* NodeJS
* Express
* body-parser
* Redis
* redis-lock

## Setup

In terminal:
```
git clone https://github.com/defint/social-tournament
cd social-tournament
npm i
docker-compose up
```

## Acceptance test

### Integer

* http://localhost:3000/reset
* http://localhost:3000/fund?playerId=P1&points=300 
* http://localhost:3000/fund?playerId=P2&points=300 
* http://localhost:3000/fund?playerId=P3&points=300 
* http://localhost:3000/fund?playerId=P4&points=500 
* http://localhost:3000/fund?playerId=P5&points=1000 
* http://localhost:3000/announceTournament?tournamentId=1&deposit=1000
* http://localhost:3000/joinTournament?tournamentId=1&playerId=P5
* http://localhost:3000/joinTournament?tournamentId=1&playerId=P1&backerId=P2&backerId=P3&backerId=P4
* curl -H "Content-Type: application/json" -X POST -d '{"tournamentId": "1", "winners": [{"playerId": "P1", "prize": 2000}]}' http://localhost:3000/resultTourment
* http://localhost:3000/balance?playerId=P1
* http://localhost:3000/balance?playerId=P2
* http://localhost:3000/balance?playerId=P3
* http://localhost:3000/balance?playerId=P4
* http://localhost:3000/balance?playerId=P5

### Float 

* http://localhost:3000/reset
* http://localhost:3000/fund?playerId=P1&points=100 
* http://localhost:3000/fund?playerId=P2&points=110 
* http://localhost:3000/announceTournament?tournamentId=1&deposit=119
* http://localhost:3000/joinTournament?tournamentId=1&playerId=P1&backerId=P2
* curl -H "Content-Type: application/json" -X POST -d '{"tournamentId": "1", "winners": [{"playerId": "P1", "prize": 119}]}' http://localhost:3000/resultTourment
* http://localhost:3000/balance?playerId=P1
* http://localhost:3000/balance?playerId=P2

### Multiple winners

* http://localhost:3000/reset
* http://localhost:3000/fund?playerId=P1&points=100 
* http://localhost:3000/fund?playerId=P2&points=200 
* http://localhost:3000/fund?playerId=P3&points=300 
* http://localhost:3000/fund?playerId=P4&points=400 
* http://localhost:3000/fund?playerId=P5&points=500 
* http://localhost:3000/announceTournament?tournamentId=1&deposit=250
* http://localhost:3000/joinTournament?tournamentId=1&playerId=P5
* http://localhost:3000/joinTournament?tournamentId=1&playerId=P4
* http://localhost:3000/joinTournament?tournamentId=1&playerId=P1&backerId=P2&backerId=P3
* curl -H "Content-Type: application/json" -X POST -d '{"tournamentId": "1", "winners": [{"playerId": "P1", "prize": 350},{"playerId": "P4", "prize": 350}]}' http://localhost:3000/resultTourment
* http://localhost:3000/balance?playerId=P1
* http://localhost:3000/balance?playerId=P2
* http://localhost:3000/balance?playerId=P3
* http://localhost:3000/balance?playerId=P4
* http://localhost:3000/balance?playerId=P5