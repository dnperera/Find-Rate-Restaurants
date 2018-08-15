import axios from "axios";
import { $ } from "./bling";
function addRemoveFavourite(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      //now change or toggle the color of the heart depending on selection
      //first access the clicked button with the name=heart and toggle the class
      const isTheFavourite = this.heart.classList.toggle(
        "heart__button--hearted"
      );
      $(".heart-count").textContent = res.data.favourite.length;
      //-- add heart animation class once user select the resturant as favourite
      if (isTheFavourite) {
        //select the button with name heart and then add the animation class
        this.heart.classList.add("heart__button--float");
        //remove the animation class after 2.5s
        setTimeout(() => {
          this.heart.classList.remove("heart__button--float");
        }, 2500);
      }
    })
    .catch(err => console.log("Error in updating Favourites -->", err));
}
export default addRemoveFavourite;
