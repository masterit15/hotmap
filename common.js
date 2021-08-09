function addObject(coords){
  $.ajax({
    method: 'POST',
    url: '/add_object.php',
    data: {action: 'add', coords},
    success:function(res){
      console.log(res);
    },
    error:function(err){
      console.error(err)
    }
  })
}
function getObject(){
  return new Promise((resolve, reject)=>{
    fetch('/add_object.php')
    .then(response=>response.json())
    .then(result=>{
      if(result.success){
        resolve(result)
      }
    })
  })
}
getObject().then(res=>{
  initMap(res)
})
function initMap(coords){
ymaps.ready(['Heatmap']).then(function init() {
    var obj = json;
    var myMap = new ymaps.Map('map', {
        center: [43.031645225518204, 44.649434751472754],
        zoom: 11,
        controls: []
    });

    var data = [];
    for (var i = 0; i < obj.length; i++) {
        data.push([obj[i].Cells.geoData.coordinates[0], obj[i].Cells.geoData.coordinates[1]])
    }
    
    var heatmap = new ymaps.Heatmap(data, {
        // Радиус влияния.
        radius: 15,
        // Нужно ли уменьшать пиксельный размер точек при уменьшении зума. False - не нужно.
        dissipating: false,
        // Прозрачность тепловой карты.
        opacity: 0.8,
        // Прозрачность у медианной по весу точки.
        intensityOfMidpoint: 0.2,
        // JSON описание градиента.
        gradient: {
            0.1: 'rgba(128, 255, 0, 0.8)',
            0.3: 'rgba(255, 255, 0, 0.9)',
            0.7: 'rgba(234, 72, 58, 0.9)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    });
    myMap.events.add('click', function(e) {
      let coords = e.get('coords');
      addObject(coords)
      // Если метка уже создана – просто передвигаем ее.
      // if (myPlacemark) {
      //     myPlacemark.geometry.setCoordinates(coords);
      //     getAddress(coords);
      // }
      // // Если нет – создаем.
      // else {
      //     myPlacemark = createPlacemark(coords);
      //     map.geoObjects.add(myPlacemark);
      //     // Слушаем событие окончания перетаскивания на метке.
      //     myPlacemark.events.add('dragend', function() {
      //       getAddress(myPlacemark.geometry.getCoordinates());
      //     });
      //     getAddress(coords);
      // }
    });



    heatmap.setMap(myMap);
});
}