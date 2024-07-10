function productViewCounter(url) {
  fetch(url)
    .then(response => response.text());
}


document.addEventListener('DOMContentLoaded', function () {
  var e=document.getElementsByName('product-id');
  if(e.length===0) return;

  var url="https://programs-duncan-edited-tariff.trycloudflare.com/hotproduct/"+e[0].value+'/scan';
  productViewCounter(url);
});
