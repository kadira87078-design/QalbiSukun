console.log("Start JS");

let currentsong = new Audio();
let songs = [];
let currFolder = "";
let currentSongs = [];
let albumImages = {
    "Muhammad Owais Raza Qadr": "img/owais_raza.jpg",
    "Sayyed Abdul Wasi Qadri Razavi": "img/sayyed_wasi.png",
    "Hafiz Muhammad Tahir Qadri": "img/tahir-qadri.jpg",
    "Muhammad Zohaib Qadri Ashrafi": "img/zohaib_ashrafi.jpg",
    "Ahmad Raza Qadri Attari": "img/ahmed_raza.jpg",
    "Salam": "img/Salam.jpg"
};

// buttons (ensure HTML me id="play", "next", "previous" ho)
window.addEventListener("load", () => {

    let signupBtn = document.getElementById("signupBtn");
    let loginBtn = document.getElementById("loginBtn");

    signupBtn?.addEventListener("click", () => {
        window.location.href = "signup.html";
    });

    loginBtn?.addEventListener("click", () => {
        window.location.href = "login.html";
    });

});

// ⏱ Time format
function secondsToMinutesseconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ▶️ PLAY MUSIC
function PlayMusic(track, pause = false) {

    // 🔥 clean track (important)
    track = track.replaceAll("\\", "/").split("/").pop();

    currentsong.src = `${currFolder}/${track}`;

    if (!pause) {
        currentsong.play();
        if (play) play.src = "img/pause.svg";
    }

    // 🔥 Show circle when song plays
    let circle = document.querySelector(".circle");
    if (circle) circle.style.display = "block";

    document.querySelector(".songinfo").innerText =
        decodeURIComponent(track).replace(".mp3", "");

    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    function saveRecent(song, folder) {
        let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];

        // duplicate remove
        recent = recent.filter(s => s.name !== song);

        // naya song add (top pe)
        recent.unshift({ name: song, folder: folder });

        // sirf last 5 songs rakho
        recent = recent.slice(0, 5);

        localStorage.setItem("recentSongs", JSON.stringify(recent));
    }
    saveRecent(track, currFolder);

    document.querySelector(".songinfo").innerText =
        decodeURIComponent(track).replace(".mp3", "");

    // 🔥 YAHAN ADD KARNA HAI
    let albumArt = document.getElementById("albumArt");

    if (albumArt) {
        let folderName = currFolder.split("/").pop();
        albumArt.src = albumImages[folderName] || "img/default.jpg";

        albumArt.style.display = "block"; // 🔥 show when play
    }
}

function showRecentOrPopular() {
    let recent = JSON.parse(localStorage.getItem("recentSongs"));
    let heading = document.querySelector(".song-heading");

    if (recent && recent.length > 0) {
        showSongs(recent);
        if (heading) heading.innerText = "Recently Played";  // 🔥 change
    } else {
        showSongs(allSongs);
        if (heading) heading.innerText = "Most Popular";     // 🔥 default
    }
}

// 📁 GET SONGS
async function getSongs(folder) {

    currFolder = folder; // FULL PATH (Naat/Others etc)

    let res = await fetch(`/${folder}/`);
    let text = await res.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.querySelectorAll("a[href$='.mp3']");
    songs = [];

    links.forEach(a => {
        let file = decodeURIComponent(a.getAttribute("href"))
            .replaceAll("\\", "/")
            .split("/")
            .pop();

        songs.push(file);
    });

    // UI update
    let ul = document.querySelector(".songlist ul");
    ul.innerHTML = "";

    songs.forEach(song => {
        ul.innerHTML += `
        <li data-src="${song}">
            <img  src="img/music.svg">
            <div class="info">
                <div>${decodeURIComponent(song).replace(".mp3", "")}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <img  src="img/play.svg">
            </div>
        </li>`;
    });

    // click event
    document.querySelectorAll(".songlist li").forEach(li => {
        li.addEventListener("click", () => {
            PlayMusic(li.dataset.src);
        });
    });
    async function getAllSongs() {
        let res = await fetch("songs.json");
        let data = await res.json();

        showSongs(data);
    }

    return songs;
}
let allSongs = [];

async function getAllSongs() {
    let res = await fetch("songs.json");
    allSongs = await res.json();
}

function showSongs(songArray) {
    currentSongs = songArray;

    let ul = document.querySelector(".songlist ul");
    ul.innerHTML = "";

    songArray.forEach(song => {
        ul.innerHTML += `
        <li data-src="${song.name}" data-folder="${song.folder}">
            <img  src="img/music.svg">
            
            <div class="info">
                <div>${decodeURIComponent(song.name).replace(".mp3", "")}</div>
                
            </div>

            <div class="playnow">
                <img c src="img/play.svg">
            </div>
        </li>`;
    });

    // click event
    document.querySelectorAll(".songlist li").forEach(li => {
        li.addEventListener("click", () => {
            currFolder = li.dataset.folder;
            PlayMusic(li.dataset.src);
        });
    });
}

// 🚀 MAIN
async function main() {
    await getAllSongs();
    showRecentOrPopular();
    await getAllSongs();
    // ❌ NO DEFAULT LOAD (ab kuch nahi aayega start me)

    // ▶️ play / pause
    play?.addEventListener("click", () => {
        if (!currentsong.src) return;

        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
            // 🔥 Show circle when play
            let circle = document.querySelector(".circle");
            if (circle) circle.style.display = "block";
        } else {
            currentsong.pause();
            play.src = "img/play1.svg";
        }
    });

    // ⏱ time update
    currentsong.addEventListener("timeupdate", () => {
        if (!isNaN(currentsong.duration)) {

            let percent = (currentsong.currentTime / currentsong.duration) * 100;

            document.querySelector(".songtime").innerText =
                `${secondsToMinutesseconds(currentsong.currentTime)} / ${secondsToMinutesseconds(currentsong.duration)}`;

            document.querySelector(".circle").style.left =
                `calc(${percent}% - 7px)`;
            document.querySelector(".seekbar").style.background =
                `linear-gradient(to right, #D9B369 ${percent}%, #444 ${percent}%)`;
        }
    });

    // 🔥 AUTO-PLAY NEXT SONG LOGIC
currentsong.addEventListener("ended", () => {
    console.log("Gaana khatam! Agla play ho raha hai...");

    // 1. Current song ka naam nikaalo
    let currentPath = decodeURIComponent(currentsong.src.split("/").pop());
    
    // 2. Index dhoondo ki current gaana kaunse number par hai
    let index = songs.indexOf(currentPath);

    // 3. Agar agla gaana list mein hai, toh use play karo
    if ((index + 1) < songs.length) {
        PlayMusic(songs[index + 1]);
    } else {
        // Agar album khatam ho gayi, toh pehla gaana phir se chala do (Optional)
        console.log("Album complete.");
        // PlayMusic(songs[0]); // Isse loop ban jayega
    }
});

    // 🎚 seekbar
    document.querySelector(".seekbar")?.addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;

        if (!isNaN(currentsong.duration)) {
            currentsong.currentTime = (currentsong.duration * percent) / 100;
            document.querySelector(".circle").style.left = `calc(${percent}% - 7px)`;

            // 🔥 COLOR FILL
            document.querySelector(".seekbar").style.background =
                `linear-gradient(to right, #D9B369 ${percent}%, #444 ${percent}%)`;
        }
    });

    // ⏮ previous
    previous?.addEventListener("click", () => {
        let current = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(current);

        if (index > 0) {
            PlayMusic(songs[index - 1]);
        }
    });

    // ⏭ next
    next?.addEventListener("click", () => {
        let current = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(current);

        if (index + 1 < songs.length) {
            PlayMusic(songs[index + 1]);
        }
    });

    // 📁 CARD CLICK (ab yahin se load hoga)
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {

            let folder = card.dataset.folder;

            let fullPath = `Naat/${folder}`;

            let folderSongs = await getSongs(fullPath);

            let formatted = folderSongs.map(song => ({
                name: song,
                folder: fullPath
            }));

            showSongs(formatted);

            if (folderSongs.length > 0) {
                PlayMusic(folderSongs[0]);
            }
        });
    });

    // Elements select karo
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".left");
    const closeBtn = document.querySelector(".close");

    // Safety check (important)
    if (hamburger && sidebar && closeBtn) {

        // 🔥 Sidebar OPEN
        hamburger.addEventListener("click", () => {
            sidebar.classList.add("active");
        });

        // 🔥 Sidebar CLOSE
        closeBtn.addEventListener("click", () => {
            sidebar.classList.remove("active");
        });

    }

    // 🔊 volume
    let volumeSlider = document.querySelector(".volume input");
    let volumeIcon = document.querySelector(".volume-icon");

    let lastVolume = Number(volumeSlider?.value || 50);

    const updateVolumeIcon = (value, muted = false) => {
        if (muted || value == 0) {
            volumeIcon.src = "img/novolume.svg";
        } else if (value < 50) {
            volumeIcon.src = "img/lowvolume.svg";
        } else {
            volumeIcon.src = "img/volume.svg";
        }
    };

    volumeSlider?.addEventListener("input", e => {
        let value = Number(e.target.value);

        currentsong.muted = false;
        currentsong.volume = value / 100;
        lastVolume = value > 0 ? value : lastVolume;

        e.target.style.background = `linear-gradient(to right, #D9B369 ${value}%, #444 ${value}%)`;
        updateVolumeIcon(value, false);
    });

    volumeIcon?.addEventListener("click", () => {
        if (!currentsong.src) return;

        currentsong.muted = true;
        currentsong.volume = 0;

        if (volumeSlider) {
            volumeSlider.value = 0;
            volumeSlider.style.background = `linear-gradient(to right, #D9B369 0%, #444 0%)`;
        }

        updateVolumeIcon(0, true);
    });

    // login 
    // 🔐 SIGNUP (only signup page pe chalega)
    let isLoggedIn = localStorage.getItem("loggedIn");
    let user = JSON.parse(localStorage.getItem("user"));

    let authArea = document.getElementById("authArea");
    let profile = document.getElementById("profile");
    let avatarImg = document.getElementById("avatarImg");
    let profileCardModal = document.getElementById("profileCardModal");
    let profileCardImg = document.getElementById("profileCardImg");
    let profileCardName = document.getElementById("profileCardName");
    let profileCardEmail = document.getElementById("profileCardEmail");
    let logoutBtn = document.getElementById("logoutBtn");

    if (isLoggedIn === "true" && user) {

        if (authArea) authArea.style.display = "none";
        if (profile) profile.style.display = "block";

        // 🔥 avatar fix
        if (avatarImg) {
            avatarImg.src = user.avatar ? user.avatar : "img/default.jpg";
        }

        // 🔥 Profile card data
        if (profileCardImg) {
            profileCardImg.src = user.avatar ? user.avatar : "img/default.jpg";
        }
        if (profileCardName) profileCardName.innerText = user.username || "User";
        if (profileCardEmail) profileCardEmail.innerText = user.email || "email@example.com";

        // 🔥 Avatar click - open profile card
        avatarImg?.addEventListener("click", () => {
            if (profileCardModal) {
                profileCardModal.classList.add("active");
            }
        });

        // 🔥 Close modal when clicking outside
        profileCardModal?.addEventListener("click", (e) => {
            if (e.target === profileCardModal) {
                profileCardModal.classList.remove("active");
            }
        });

        // 🔥 Logout button
        logoutBtn?.addEventListener("click", () => {
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
    }

    let searchBox = document.querySelector(".search-box");
    let searchIcon = document.querySelector(".search-icon");
    let searchInput = document.getElementById("searchInput");

    if (searchBox && searchIcon && searchInput) {
        const doSearch = () => {
            let query = searchInput.value.trim().toLowerCase();

            if (query === "") {
                showSongs(currentSongs);
                return;
            }

            let filtered = currentSongs.filter(song => {
                return song.name.toLowerCase().includes(query);
            });

            if (filtered.length === 0) {
                document.querySelector(".songlist ul").innerHTML =
                    `<li style="padding:20px;text-align:center;">No songs found 😔</li>`;
                return;
            }

            showSongs(filtered);
        };

        searchIcon.addEventListener("click", () => {
            searchBox.classList.toggle("active");
            searchInput.focus();
        });

        searchInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                doSearch();
            }
        });

        searchInput.addEventListener("input", doSearch);
    }

    let logo = document.getElementById("logo");

    logo?.addEventListener("click", () => {
        window.location.href = "index.html"; // 🔥 best reload
    });


}

main();
