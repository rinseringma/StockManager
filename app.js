// App.js

document.addEventListener("DOMContentLoaded", () => {
  const barcodeInput = document.getElementById("barcodeInput");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popupContent");
  const closePopup = document.getElementById("closePopup");

  // Focus op barcode invoer
  if (barcodeInput) barcodeInput.focus();

  // Barcode invoer logica
  barcodeInput?.addEventListener("change", (event) => {
    event.preventDefault();

    const barcode = barcodeInput.value.trim();
    const producten = JSON.parse(localStorage.getItem("producten")) || [];

    const bestaandProduct = producten.find((product) => product.barcode === barcode);

    if (bestaandProduct) {
      popupContent.innerHTML = `
        <p>Product gevonden: <strong>${bestaandProduct.titel}</strong></p>
        <p>Aantal: <strong>${bestaandProduct.aantal}</strong></p>
        <div class="grid grid-cols-2 gap-4">
          <button class='mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600' onclick='wijzigAantal("${barcode}", 1)'>+</button>
          <button class='mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600' onclick='wijzigAantal("${barcode}", -1)'>-</button>
        </div>
      `;
    } else {
      popupContent.innerHTML = `
        <p>Product niet gevonden. Wil je dit product toevoegen?</p>
        <button class='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600' onclick='toonToevoegen("${barcode}")'>Ja</button>
        <button class='mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600' onclick='sluitPopup()'>Nee</button>
      `;
    }

    popup.classList.remove("hidden");
    barcodeInput.value = "";
  });

  // Sluit popup
  closePopup?.addEventListener("click", sluitPopup);

  // Functie: Sluit popup
  function sluitPopup() {
    popup.classList.add("hidden");
    popupContent.innerHTML = "";
  }

  // Functie: Wijzig aantal
  window.wijzigAantal = (barcode, wijziging) => {
    const producten = JSON.parse(localStorage.getItem("producten")) || [];
    const product = producten.find((p) => p.barcode === barcode);

    if (product) {
      product.aantal = Math.max(0, product.aantal + wijziging);
      localStorage.setItem("producten", JSON.stringify(producten));
    }

    sluitPopup();
    window.location.href = "voorraadbeheer_pagina.html";
  };

  // Functie: Toon toevoegen
  window.toonToevoegen = (barcode) => {
    popupContent.innerHTML = `
      <h2 class='text-xl font-bold mb-4'>Nieuw product</h2>
      <label class='block mb-2'>Titel</label>
      <input id='newTitle' type='text' class='w-full p-2 border rounded mb-4'>
      <label class='block mb-2'>Barcode</label>
      <input id='newBarcode' type='text' value='${barcode}' class='w-full p-2 border rounded mb-4' disabled>
      <label class='block mb-2'>Aantal</label>
      <input id='newAantal' type='number' value='1' class='w-full p-2 border rounded mb-4'>
      <button onclick='voegProductToe()' class='w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'>Bevestigen</button>
    `;
  };

  // Functie: Voeg product toe
  window.voegProductToe = () => {
    const titel = document.getElementById("newTitle").value.trim();
    const barcode = document.getElementById("newBarcode").value.trim();
    const aantal = parseInt(document.getElementById("newAantal").value, 10);

    if (titel && barcode && aantal >= 0) {
      const producten = JSON.parse(localStorage.getItem("producten")) || [];
      producten.push({ titel, barcode, aantal });
      localStorage.setItem("producten", JSON.stringify(producten));
    }

    sluitPopup();
    window.location.href = "voorraadbeheer_pagina.html";
  };

  // Ophalen en weergeven van producten op de voorraadbeheerpagina
  const beheerTableBody = document.getElementById("beheerTableBody");
  if (beheerTableBody) {
    const producten = JSON.parse(localStorage.getItem("producten")) || [];

    if (producten.length === 0) {
      beheerTableBody.innerHTML = "<tr><td colspan='4' class='text-center p-4'>Geen producten gevonden.</td></tr>";
      return;
    }

    producten.forEach((product, index) => {
      const row = document.createElement("tr");
      row.classList.add("border-b");

      row.innerHTML = `
        <td class='p-2'>${index}</td>
        <td class='p-2'>${product.titel}</td>
        <td class='p-2'>${product.barcode}</td>
        <td class='p-2'>${product.aantal}</td>
        <td class='p-2 text-center'>
          <button class='text-blue-500 hover:underline' onclick='openEditPopup(${index})'>✏️</button>
          <button class='text-blue-500 hover:underline' onclick='removeProduct(${index})'>🗑️</button>
        </td>
      `;
      beheerTableBody.appendChild(row);
    });
  }

  // Open de popup om een product te bewerken
  window.openEditPopup = (index) => {
    const producten = JSON.parse(localStorage.getItem("producten")) || [];
    const product = producten[index];

    if (!product) return;

    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    if (!popup || !popupContent) {
      console.error("Popup-elementen niet gevonden.");
      return;
    }

    popupContent.innerHTML = `
      <form>
        <h2 class='text-xl font-bold mb-4'>Bewerk product</h2>
        <label class='block mb-2'>Titel</label>
        <input id='editTitle' type='text' value='${product.titel}' class='w-full p-2 border rounded mb-4'>
        <label class='block mb-2'>Barcode</label>
        <input id='editBarcode' type='text' value='${product.barcode}' class='w-full p-2 border rounded mb-4' disabled>
        <label class='block mb-2'>Aantal</label>
        <input id='editAantal' type='number' value='${product.aantal}' class='w-full p-2 border rounded mb-4'>
        <button onclick='saveEdit(${index})' class='w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'>Opslaan</button>
      </form>
    `;
    popup.classList.remove("hidden");
  };

  // Verwijder product
  window.removeProduct = (index) => {
    const producten = JSON.parse(localStorage.getItem("producten")) || [];
    const product = producten[index];

    if (!product) return;

    producten.splice(index, 1);
    console.log(producten);
    localStorage.setItem('producten', JSON.stringify(producten));

    window.location.reload();

  };

  // Opslaan van wijzigingen
  window.saveEdit = (index) => {
    const producten = JSON.parse(localStorage.getItem("producten")) || [];
    const product = producten[index];

    if (!product) return;

    product.titel = document.getElementById("editTitle").value;
    product.aantal = parseInt(document.getElementById("editAantal").value, 10);

    localStorage.setItem("producten", JSON.stringify(producten));

    window.location.reload();
  };
});
