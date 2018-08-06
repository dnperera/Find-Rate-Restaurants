function autoComplete(input, latInput, lngInput) {
  if (!input) {
    //skip this fn from running if there is no address value
    return;
  }
  const addressesDropdown = new google.maps.places.Autocomplete(input);
  addressesDropdown.addListener("place_changed", () => {
    const place = addressesDropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  //if someone hits enter on the address field, stop submitting the form
  input.on("keydown", e => {
    if (e.keycode === 13) {
      e.preventDefault();
    }
  });
}
export default autoComplete;
