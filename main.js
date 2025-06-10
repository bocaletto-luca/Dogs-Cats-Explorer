 /************************************************************************************************************
     * EN: Animal Gallery Explorer – Dogs & Cats with Breed Selection, Pagination, Full-Screen Modal,
     *     and Favorites (All categories available)
     * IT: Animal Gallery Explorer – Cani e Gatti con selezione razze, paginazione, modal a schermo intero,
     *     e Preferiti (tutte le categorie disponibili)
     * ----------------------------------------------------------------------------------------------------------
     * EN: This app uses free APIs:
     *     - Dog CEO API for dogs (to retrieve the list of breeds and random images)
     *     - The Cat API for cats (to retrieve a list of cat breeds and images with breed details)
     *     It allows users to filter by breed with an "All" option, load more images (using pagination),
     *     and view images in full-screen modal displaying extra details (for cats, breed details are shown
     *     if available). Favorite images can be added and viewed in a dedicated tab.
     *
     * IT: Questa app utilizza API gratuite:
     *     - Dog CEO API per i cani (per scaricare la lista delle razze e immagini casuali)
     *     - The Cat API per i gatti (per ottenere una lista di razze e immagini con dettagli sul breed)
     *     L'app permette di filtrare per razza con opzione "All", caricare ulteriori immagini (pag. load more),
     *     e visualizzare le immagini in modal a schermo intero mostrando dettagli extra (per i gatti, vengono mostrati
     *     i dettagli del breed se disponibili). Le immagini favorite possono essere aggiunte e visualizzate in una sezione dedicata.
     ************************************************************************************************************/
    
    // ---------------------------
    // Global Variables and Favorites Array
    // ---------------------------
    let favorites = []; // Array to store favorites (object: {url, type, details})
    
    // ---------------------------
    // Navigation Tabs
    // ---------------------------
    const navTabs = document.getElementById("navTabs");
    const sections = document.querySelectorAll(".section");
    
    navTabs.addEventListener("click", (event) => {
      const targetBtn = event.target.closest(".nav-link");
      if (!targetBtn) return;
      // Remove active class from all nav links and add to clicked one
      navTabs.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));
      targetBtn.classList.add("active");
      // Show corresponding section
      const targetSectionId = targetBtn.getAttribute("data-target");
      sections.forEach(section => {
        section.classList.toggle("active", section.id === targetSectionId);
      });
      // If favorites section, update grid
      if (targetSectionId === "favoritesSection") {
        displayFavorites();
      }
    });
    
    // ---------------------------
    // DOGS SECTION
    // ---------------------------
    const dogBreedSelect = document.getElementById("dogBreedSelect");
    const loadDogsBtn = document.getElementById("loadDogsBtn");
    const dogsGrid = document.getElementById("dogsGrid");
    const loadMoreDogsBtn = document.getElementById("loadMoreDogsBtn");
    
    let dogImagesLoaded = [];
    // Function to load the list of dog breeds from Dog CEO API
    async function loadDogBreeds() {
      try {
        const response = await fetch("https://dog.ceo/api/breeds/list/all");
        if (!response.ok) throw new Error("Network response not OK: " + response.status);
        const data = await response.json();
        const breeds = Object.keys(data.message);
        // Populate dropdown with "All" then all breeds
        dogBreedSelect.innerHTML = '<option value="all">All</option>';
        breeds.forEach(breed => {
          const option = document.createElement("option");
          option.value = breed;
          option.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
          dogBreedSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading dog breeds:", error);
      }
    }
    
    // Function to load dog images (12 per load)
    async function loadDogImages(reset = false) {
      if (reset) dogImagesLoaded = [];
      let url = "";
      if (dogBreedSelect.value === "all") {
        url = `https://dog.ceo/api/breeds/image/random/12`;
      } else {
        url = `https://dog.ceo/api/breed/${dogBreedSelect.value}/images/random/12`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response not OK: " + response.status);
        const data = await response.json();
        // Append new images to global dogImagesLoaded
        dogImagesLoaded = dogImagesLoaded.concat(data.message);
        displayImages(dogImagesLoaded, dogsGrid, "dog");
      } catch (error) {
        console.error("Error loading dog images:", error);
        dogsGrid.innerHTML = "<p class='text-center text-danger'>Error loading dog images.</p>";
      }
    }
    
    loadDogsBtn.addEventListener("click", () => loadDogImages(true));
    loadMoreDogsBtn.addEventListener("click", () => loadDogImages(false));
    
    // ---------------------------
    // CATS SECTION
    // ---------------------------
    const catBreedSelect = document.getElementById("catBreedSelect");
    const loadCatsBtn = document.getElementById("loadCatsBtn");
    const catsGrid = document.getElementById("catsGrid");
    const loadMoreCatsBtn = document.getElementById("loadMoreCatsBtn");
    
    let catImagesLoaded = [];
    let catImagePage = 0;
    // Function to load list of cat breeds from The Cat API
    async function loadCatBreeds() {
      try {
        const response = await fetch("https://api.thecatapi.com/v1/breeds");
        if (!response.ok) throw new Error("Network response not OK: " + response.status);
        const data = await response.json();
        // Populate dropdown with "All" then each breed (using breed id)
        catBreedSelect.innerHTML = '<option value="all">All</option>';
        data.forEach(breed => {
          const option = document.createElement("option");
          option.value = breed.id;
          option.textContent = breed.name;
          catBreedSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading cat breeds:", error);
      }
    }
    
    // Function to load cat images (12 per load) from The Cat API
    async function loadCatImages(reset = false) {
      if (reset) { 
        catImagesLoaded = [];
        catImagePage = 0;
      }
      catImagePage++;
      let url = "";
      if (catBreedSelect.value === "all") {
        url = `https://api.thecatapi.com/v1/images/search?limit=12&page=${catImagePage}`;
      } else {
        url = `https://api.thecatapi.com/v1/images/search?breed_ids=${catBreedSelect.value}&limit=12&page=${catImagePage}`;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response not OK: " + response.status);
        const data = await response.json();
        // For each result, extract url and, if available, breed details (first element of breeds array)
        const catResults = data.map(item => ({
          url: item.url,
          details: (item.breeds && item.breeds.length > 0) ? item.breeds[0] : null
        }));
        catImagesLoaded = catImagesLoaded.concat(catResults);
        displayImages(catImagesLoaded, catsGrid, "cat");
      } catch (error) {
        console.error("Error loading cat images:", error);
        catsGrid.innerHTML = "<p class='text-center text-danger'>Error loading cat images.</p>";
      }
    }
    
    loadCatsBtn.addEventListener("click", () => loadCatImages(true));
    loadMoreCatsBtn.addEventListener("click", () => loadCatImages(false));
    
    // ---------------------------
    // COMMON FUNCTION: Display Images in Grid
    // ---------------------------
    /**
     * EN: Display an array of images in the specified container.
     * IT: Visualizza un array di immagini nel contenitore specificato.
     * For dogs, the array elements are URL strings.
     * For cats, the array elements are objects: {url, details}
     */
    function displayImages(images, container, type) {
      container.innerHTML = "";
      if (!images || images.length === 0) {
        container.innerHTML = "<p class='text-center text-danger'>No images available.</p>";
        return;
      }
      images.forEach(item => {
        let url = (typeof item === "string") ? item : item.url;
        const colDiv = document.createElement("div");
        colDiv.className = "col-12 col-sm-6 col-md-4";
        
        const cardDiv = document.createElement("div");
        cardDiv.className = "img-card";
        
        const img = document.createElement("img");
        img.src = url;
        img.alt = type === "dog" ? "Dog Image" : "Cat Image";
        cardDiv.appendChild(img);
        
        // Add Favorite button overlay
        const favBtn = document.createElement("button");
        favBtn.className = "fav-btn btn btn-sm btn-warning";
        favBtn.textContent = "Favorite";
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          addToFavorites(url, type, (typeof item === "object") ? item.details : null);
        });
        cardDiv.appendChild(favBtn);
        
        // Add click event to open full-screen modal with extra details
        cardDiv.addEventListener("click", () => {
          openModal(url, type, (typeof item === "object") ? item.details : null);
        });
        
        colDiv.appendChild(cardDiv);
        container.appendChild(colDiv);
      });
    }
    
    // ---------------------------
    // FAVORITES SECTION
    // ---------------------------
    const favoritesGrid = document.getElementById("favoritesGrid");
    
    /**
     * EN: Add an image to favorites if not already present.
     * IT: Aggiungi un'immagine ai preferiti se non già presente.
     */
    function addToFavorites(url, type, details = null) {
      if (favorites.some(item => item.url === url)) {
        alert("Image already in favorites!");
        return;
      }
      favorites.push({ url, type, details });
      alert("Added to favorites!");
    }
    
    /**
     * EN: Display favorites in the favorites grid.
     * IT: Visualizza i preferiti nella griglia dedicata.
     */
    function displayFavorites() {
      favoritesGrid.innerHTML = "";
      if (favorites.length === 0) {
        favoritesGrid.innerHTML = "<p class='text-center'>No favorites saved.</p>";
        return;
      }
      favorites.forEach(item => {
        const colDiv = document.createElement("div");
        colDiv.className = "col-12 col-sm-6 col-md-4";
        
        const cardDiv = document.createElement("div");
        cardDiv.className = "img-card";
        
        const img = document.createElement("img");
        img.src = item.url;
        img.alt = item.type === "dog" ? "Favorite Dog" : "Favorite Cat";
        cardDiv.appendChild(img);
        
        // Remove from favorites button
        const removeBtn = document.createElement("button");
        removeBtn.className = "fav-btn btn btn-sm btn-danger";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeFromFavorites(item.url);
        });
        cardDiv.appendChild(removeBtn);
        
        // Allow click to open modal to view details
        cardDiv.addEventListener("click", () => {
          openModal(item.url, item.type, item.details);
        });
        
        colDiv.appendChild(cardDiv);
        favoritesGrid.appendChild(colDiv);
      });
    }
    
    /**
     * EN: Remove an image from favorites.
     * IT: Rimuovi un'immagine dai preferiti.
     */
    function removeFromFavorites(url) {
      favorites = favorites.filter(item => item.url !== url);
      displayFavorites();
    }
    
    // ---------------------------
    // FULL-SCREEN MODAL
    // ---------------------------
    const imgModal = new bootstrap.Modal(document.getElementById("imgModal"));
    const modalImage = document.getElementById("modalImage");
    const imgModalLabel = document.getElementById("imgModalLabel");
    const modalDetails = document.getElementById("modalDetails");
    
    /**
     * EN: Open the modal with the image in full screen.
     * If type is "cat" and details are available, show extra info.
     * IT: Apri il modal a schermo intero mostrando l'immagine ingrandita.
     * Se il tipo è "cat" e sono disponibili dettagli, mostra informazioni extra.
     * @param {string} url - Image URL.
     * @param {string} type - "dog" or "cat".
     * @param {object|null} details - Extra details (for cats).
     */
    function openModal(url, type, details = null) {
      imgModalLabel.textContent = type === "dog" ? "Dog Image" : "Cat Image";
      modalImage.src = url;
      modalImage.alt = type === "dog" ? "Dog Image" : "Cat Image";
      
      // For cats, display extra details if available
      if (type === "cat" && details) {
        modalDetails.innerHTML = `
          <p><strong>Breed:</strong> ${details.name || "N/A"}</p>
          <p><strong>Description:</strong> ${details.description || "N/A"}</p>
          <p><strong>Temperament:</strong> ${details.temperament || "N/A"}</p>
          <p><strong>Origin:</strong> ${details.origin || "N/A"}</p>
          <p><strong>Weight:</strong> ${details.weight ? details.weight.metric + " kg" : "N/A"}</p>
        `;
      } else {
        modalDetails.innerHTML = "";
      }
      imgModal.show();
    }
    
    // ---------------------------
    // INITIALIZATION
    // ---------------------------
    // Load dog and cat breeds on page load
    loadDogBreeds();
    loadCatBreeds();
    
    // Optionally, the user can click the "Load Images" buttons to load images
    // (No auto-loading is done here, waiting for user action)
    
