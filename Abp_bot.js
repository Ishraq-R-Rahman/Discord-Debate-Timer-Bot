const Discord = require('discord.js');
const client = new Discord.Client();

// const ytdl = require('ytdl-core');


let servers = {};
let channelsMap = new Map(); // checks whether a timer's running in a channel
let channelTimer = new Map();

client.on( 'ready' , () =>{
    console.log("Connected as " + client.user.tag );

    client.user.setActivity( "WITH DEBATERS.👻" , {type: "PLAYING"});

    let debateChannelID = []; // all the channels the bot will be active in all servers.
    

    client.guilds.cache.forEach( guild => {
        console.log( "In " + guild.name );

        guild.channels.cache.forEach( channel => {
            // console.log(`${channel.name} ${channel.type} ${channel.id}`);
            if( channel.type == "text" && !channel.name.includes("bot")){
                debateChannelID.push( channel.id );
            }
            
        })

    })

    console.log("Here :" + debateChannelID );

    let debateChannel;
    
    debateChannelID.forEach( ID => {
        debateChannel =  client.channels.cache.get( ID );
        debateChannel.send( "Hello!!! 😁 \nI'm active in this channel right now." ).catch( console.error );
    })
    
})


client.on('message' , (receivedMessage)=>{
    // console.log(receivedMessage);

    // bots replying to itself loop break.

    // console.log("Looking for channel:\n" + receivedMessage.channel );

    //this prevents multiple timers from starting in the same channel

    if( client.user == receivedMessage.author ){
        return;
    }
    
    if( receivedMessage.content.startsWith("!") ){
        processCommand( receivedMessage  );
    }
})

let processCommand = ( receivedMessage )=>{
    let fullCommand = receivedMessage.content.substr(1);
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0];
    let arguments = splitCommand.slice(1);

    if( primaryCommand == "debate" ){
        if( channelsMap[ receivedMessage.channel ] ){
            receivedMessage.channel.send( "Timer is already running. Stop the timer before running commands, fool. 😡");
            return;
        }
    
        channelsMap[ receivedMessage.channel ] = false;
        timerCommand( arguments ,receivedMessage );
    }
    else if( primaryCommand == "poi"){
        audioCommand( receivedMessage , 3 );
    }
    else if( primaryCommand == "stop" ){
        clearInterval( channelTimer[ receivedMessage.channel ] );
        channelsMap[ receivedMessage.channel ] = false ; 
        receivedMessage.channel.send("Stopped Timer. It's free to use again. 🤗");
    }
    else if( primaryCommand == "help" ){
        receivedMessage.channel.send("Commands:"+
        "\n!debate [time] : starts the timer. (ignore the 3rd brackets)"+
        "\n!poi: raises poi"+
        "\n!stop: stops timer if it's running.");
1
    }
    else{
       receivedMessage.channel.send("Command not recognized. Try Using !debate [time] or !poi");    
    }
}

let timerCommand = ( arguments ,receivedMessage ) =>{

    if( arguments.length !== 1 ){
        receivedMessage.channel.send("Invalid Command. Try using just !debate [time] ");
        return ;
    }

    receivedMessage.channel.send("Have started timer for "+ arguments[0] +" minutes. Good Luck, " + receivedMessage.author.username +"!");

    let counter = 0;
   
    channelsMap[ receivedMessage.channel ] = true ; // timer has started


    let timer = setInterval( () => {
        counter++;
        if( counter == arguments[0] - 1 && arguments[0] > 1 ){
            receivedMessage.channel.send( (arguments[0] - 1 )+ " minutes have passed");
            let presenceChannel = audioCommand( receivedMessage , 1 );
            if( !presenceChannel ){
                channelsMap[ receivedMessage.channel ] = false ; 
                return;
            }
        }
        else if( counter == 1 ){
            receivedMessage.channel.send( "1 minute has passed");
            // console.log( receivedMessage.member.voice.channel );
            let presenceChannel = audioCommand( receivedMessage , 1 );
            if( !presenceChannel ){
                channelsMap[ receivedMessage.channel ] = false ; 
                return;
            }
            
        }
        else if( counter >= arguments[0] ){
            receivedMessage.channel.send("TIME'S UP!!!!!!");
            channelsMap[ receivedMessage.channel ] = false ; 
            audioCommand( receivedMessage , 2 );

            clearInterval( timer );
        }

    } , 60 * 1000 );

    channelTimer[ receivedMessage.channel ] = timer ;
}


let audioCommand = ( receivedMessage , bell )=>{

    let play = ( connection , receivedMessage )=>{
        var server = servers[ receivedMessage.guild.id ]; // gets the server the message is coming from.
        server.dispatcher = connection.play( server.queue[0] , { volume: 0.6 } );
        //ytdl( server.queue[0], { filter: "audioonly" } )

        server.queue.shift(); // dequeues the audio.
        server.dispatcher.on("end", ()=>{
            if( server.queue[0] ){
                play( connection, receivedMessage );
            }
            else{
                connection.disconnect();
            }
        })
    }

    if( !receivedMessage.member.voice.channel ){
        receivedMessage.channel.send( receivedMessage.author.username +", You are currently not in a channel. 😕");
        return null;
    }

    if( !servers[receivedMessage.guild.id ] ){
        servers[receivedMessage.guild.id] = {
            queue: []
        }
    }

    var server = servers[receivedMessage.guild.id];
    if ( bell == 1 ){
        server.queue.push( "./Audio/bell.mp3" );
    }
    else if( bell == 2 ){
        
        server.queue.push("./Audio/double_bell.mp3");
    }
    else if( bell == 3 ){
        server.queue.push( "./Audio/poi.mp3" );
    }
    
    if( !receivedMessage.member.voice.connection ){
        receivedMessage.member.voice.channel.join().then( connection =>{
            play( connection , receivedMessage );
        })
    }
    
}

client.login("");