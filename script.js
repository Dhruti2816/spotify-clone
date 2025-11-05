console.log("let's write js");
let currentSong = new Audio();
let songs = [];
let currFolder;

async function getSongs(folder) {
  
    currFolder = folder;
    let url = `http://127.0.0.1:3000/songs/${folder}`;
  
    
    let response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    let songsList = await response.json(); // ✅ Expecting JSON response
 
    
    songs = songsList.map(song => song.name); // ✅ Extract song names
       
    
    
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    songUL.innerHTML = "";

    for (const song of songs) {
        
        songUL.innerHTML +=`<li> <img class="invert" src="music.svg" alt="">
         
                             <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Dhruti</div>
                             </div> 

                             <div class="playnow">
                                <span>PLay Now</span>
                                <img class="invert "src="play1.svg" alt="">
                             </div> </li>`;
    }


    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=> {
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    

    return songs;
   
}




const playMusic = (track) => {
    let songPath = `http://127.0.0.1:3000/songs/${currFolder}/${encodeURIComponent(track)}`;
    console.log("Playing:", songPath);
    currentSong.src = songPath;
    currentSong.load();
    currentSong.play();

    document.querySelector(".play").src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/img1.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}



async function main() {
    
    let songs = await getSongs("ncs"); 

    console.log(songs);

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            console.log("Fetching Songs from:", folder);

            songs = await getSongs(folder); // Load songs from clicked card's folder

            if (songs.length > 0) {
                playMusic(songs[0]); // Play first song from the new folder
            }
        });
    });

    await displayAlbums()


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play1.svg";
        }
    });
    


    function secondsToMinutesSeconds(sec) {
        let minutes = Math.floor(sec / 60);
        let seconds = Math.floor(sec % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
            console.log("Updating time:", currentSong.currentTime, currentSong.duration); // Debugging
            document.querySelector(".songtime").innerHTML = 
                `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    
            const circle = document.querySelector(".circle");
            if (circle) {
                circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
            }
        }
    });
    

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });
    
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
    

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })


}

main();
