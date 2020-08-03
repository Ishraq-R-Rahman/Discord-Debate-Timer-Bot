const Discord = require('discord.js');
const client = new Discord.Client();

// const ytdl = require('ytdl-core');


let servers = {};

client.on( 'ready' , () =>{
    console.log("Connected as " + client.user.tag );

    client.user.setActivity( "WITH DEBATERS.👻" , {type: "PLAYING"});

    let debateChannelID = []; // all the channels the bot will be active in all servers.
    

    client.guilds.cache.forEach( guild => {
        console.log( "In " + guild.name );

        guild.channels.cache.forEach( channel => {
            console.log(`${channel.name} ${channel.type} ${channel.id}`);
            if( channel.type == "text" && channel.name !== "tabby-bot" && channel.name !== "timer-bot"){
                debateChannelID.push( channel.id );
            }
            
        })

    })

    console.log("Here :" + debateChannelID );

    let debateChannel;
    // debateChannel =  client.channels.cache.get( debateChannelID[0] );
    // console.log( debateChannel );
    debateChannelID.forEach( ID => {
        debateChannel =  client.channels.cache.get( ID );
        debateChannel.send( "Hello!!! 😁 \nI'm active in this channel right now." ).catch( console.error );
    })
    
})


client.on('message' , (receivedMessage)=>{
    // console.log(receivedMessage);

    // bots replying to itself loop break.

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
        timerCommand( arguments ,receivedMessage );
    }
    else if( primaryCommand == "poi"){
        audioCommand( receivedMessage , 3 );
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
    let finished = false;

    let timer = setInterval( () => {
        counter++;
        if( counter == arguments[0] - 1 && arguments[0] > 1 ){
            receivedMessage.channel.send( (arguments[0] - 1 )+ " minutes have passed");
            let presenceChannel = audioCommand( receivedMessage , 1 );
            if( !presenceChannel ){
                return;
            }
        }
        else if( counter == 1 ){
            receivedMessage.channel.send( "1 minute has passed");
            // console.log( receivedMessage.member.voice.channel );
            let presenceChannel = audioCommand( receivedMessage , 1 );
            if( !presenceChannel ){
                return;
            }
            
        }
        else if( counter >= arguments[0] ){
            receivedMessage.channel.send("TIME'S UP!!!!!!");
            finished = true;
            audioCommand( receivedMessage , 2 );

            clearInterval( timer );
        }

    } , 60 * 1000 );
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
        receivedMessage.channel.send( receivedMessage.author.username +", You are currently not in a channel.");
        return null;
    }

    if( !servers[receivedMessage.guild.id ] ){
        servers[receivedMessage.guild.id] = {
            queue: []
        }
    }

    var server = servers[receivedMessage.guild.id];
    if ( bell == 2 ){
        server.queue.push("./Audio/double_bell.mp3");

    }
    else if( bell == 1 ){
        server.queue.push( "./Audio/bell.mp3" );
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

client.login("NzM5NTEzMzc2NjA2MTI2MTEx.XybjgA.TwiZqSL3vhEOWz3JCMafDVDVHlQ")