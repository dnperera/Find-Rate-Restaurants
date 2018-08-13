import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(stores) {
  return stores
    .map(store => {
      return `
    <a href='/stores/${store.slug}' class='search__result'>
      <strong>${store.name}</strong>
    </a>
    `;
    })
    .join("");
}
function searchResturant(search) {
  if (!search) {
    return;
  }
  //const searchInput = search.querySelector(".search__input");
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector(".search__results");
  searchInput.on("input", function() {
    //if there is no search value, hide search results div
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }
    //if there is search value , first remove hidden property from search results div
    searchResults.style.display = "block";

    axios
      .get(`/api/search?q=${this.value}`)
      .then(results => {
        if (results.data.length) {
          searchResults.innerHTML = dompurify.sanitize(
            searchResultsHTML(results.data)
          );
          return;
        }
        //if there is no results
        searchResults.innerHTML = dompurify.sanitize(
          `<div class='search__result'>No results for <strong>${
            this.value
          }</strong> found! </div>`
        );
      })
      .catch(err => {
        console.log(err);
      });
  });

  //handle keyboard inputs
  searchInput.on("keyup", e => {
    //if the user are not pressing enter ,up arrow or down arrow ,do nothing
    if (![38, 40, 13].includes(e.keyCode)) {
      return; //skip it
    }
    const activeClass = "search__result--active";
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;
    if (e.keyCode === 40 && current) {
      // down arrrow and already selected
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      // down arrow , first time
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      //up arrow and already selected, then select previous or last item
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      // if first time press up arrow , then select last item
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default searchResturant;
