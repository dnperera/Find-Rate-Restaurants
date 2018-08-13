import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import autoComplete from "./modules/autoComplete";
import searchResturant from "./modules/searchResturant";
import makeMap from "./modules/map";
autoComplete($("#address"), $("#lat"), $("#lng"));
searchResturant($(".search"));
makeMap($("#map"));
