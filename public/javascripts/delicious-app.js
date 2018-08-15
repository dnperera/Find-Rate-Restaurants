import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import autoComplete from "./modules/autoComplete";
import searchResturant from "./modules/searchResturant";
import addRemoveFavourite from "./modules/favourites";
import makeMap from "./modules/map";
autoComplete($("#address"), $("#lat"), $("#lng"));
searchResturant($(".search"));
makeMap($("#map"));

//select all form tags with class of heart
const heartForms = $$("form.heart");
heartForms.on("submit", addRemoveFavourite);
