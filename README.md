# communauto-discord-bot
A Discord bot that allows you to get available cars from Communauto in the province of Quebec.

## Setup
1. Follow the instructions on the [Discord Developer Portal](https://discord.com/developers/applications) to create a new bot.
2. Create a `.env` file in the root directory of the project and add the environment variables that you can find in the `.env.placeholders` file.
3. Run `npm install` to install the dependencies.
4. Run `npm start` to start the bot.

## Commands
### Free-floating cars

```
/flex [latitude] [longitude] [radius] [frequency]
```

Get a list of free-floating cars in a defined radius around a specified location. The default radius is 1 km.  
If no frequency is specified, the request will be made once.  
Re run the command to stop the request if a frequency is set.

### Station-based cars

```
/station [start_date] [end_date] [station_id] [vehicle_type] [frequency]
```

 If no `station_id` is specified, get a list of all avaible cars in the specified time frame (only one vehicle per station is returned).  
 If a `station_id` is specified, get all the cars available at that station in the specified time frame. 

### Other commands

```
/book [id] [type] [start_date] [end_date]
```
Book a car for a specific time frame for a station-based, or for now for a free-floating.  
The `id` is the id of the car you want to book.  
The `type` is `flex` or `station` depending if the vehicle is a station-based or a free-floating.  
The `start_date` and `end_date` are the time frame you want to book the car for. 

```
/vehicle [id] [type]
```
Get information about a specific vehicle.  
The `id` is the id of the car you want to get information about.  
The `type` is `flex` or `station` depending if the vehicle is a station-based one or a free-floating.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Disclaimer
This project is not affiliated with Communauto in any way. It is an unofficial project created for personal use only. Use of their API is subject to their terms and conditions.
