
var myPlacemark;
var myMap;
// добавление объектов
function addObject(data){
    let formData = new FormData()
    formData.append('action', 'add')
    formData.append('coords', data.coords)
    formData.append('address', data.address)
    fetch('/add_object.php', {
      method: 'POST',
      body: formData
    })
    .then(response=>response.json())
    .then(result=>{
      if(result.success){
        // console.log(result)
      }else{
        console.error('error')
      }
    })
}
// подгрузка всех объектов
function getObject(){
  return new Promise((resolve, reject)=>{
    fetch('/add_object.php?action=get')
    .then(response=>response.json())
    .then(result=>{
      if(result.success){
        resolve(result)
      }else{
        reject('err')
      }
    })
  })
}

getObject().then(res=>{

  initMaps(res.result)
})






function initMaps(obj, param='heat_map'){
ymaps.ready(['Heatmap']).then(function init() {
    myMap = new ymaps.Map('map', {
        center: [43.031645225518204, 44.649434751472754],
        zoom: 13,
        controls: []
    });
    
    var data = [];
    var Placemark = {};
    var ClusterContent = ymaps.templateLayoutFactory.createClass('<div class="claster" ><span>$[properties.geoObjects.length]</span></div>');
    //Параметры иконки кластера, обычно её делают отличной от точки, чтобы пользователь не путал номер объекта
    // и количество объектов
    var clusterIcons = [{
      href: '/img/map-claster.png',
      size: [58, 80],
      offset: [-24, -80],
    }];
    //Создание самого кластера
    myClusterer = new ymaps.Clusterer({
      clusterIcons: clusterIcons,
      clusterNumbers: [1],
      zoomMargin: [30],
      clusterIconContentLayout: ClusterContent,
    });
    //HTML шаблон балуна, того самого всплывающего блока, который появляется при щелчке на карту
    var myBalloonLayout = ymaps.templateLayoutFactory.createClass(
      `<div class="ballon">
        <div class="ballon_media" style="background-image: url($[properties.img])"></div>
        <div class="ballon_content">
          <p class="ballon_content_title"><strong>$[properties.name]</strong></p>
          <ul class="ballon_content_info" >
            <li><strong>Адрес:</strong> $[properties.address]</li>
            <li><strong>Дата Акта проверки з/у:</strong> $[properties.dateVerification]</li>
            <li><strong>Выявленое нарушения:</strong> $[properties.violations]</li>
            <li><strong>Функциональное назначение:</strong> $[properties.function] </li>
            <li><strong>Этажность (кол-во этажей):</strong> $[properties.floors]</li>
            <li><strong>Площадь застройки (кв.м):</strong> $[properties.square]</li>
            <li><strong><a href="$[properties.url]">Подробнее</a></strong></li>
          </ul>
        </div>
      </div>`
      // ,
      // {
      //   build: function () {
      //     myBalloonLayout.superclass.build.call(this);
      //     $('button[data-val]').on('click', function(){
            
      //       let data = {
      //         elid: $(this).data('id'),
      //         action: "vote",
      //         ip_address: "<?=$_SERVER['REMOTE_ADDR']?>",
      //         vote: $(this).data('val')
      //       };
      //       let spanT = $(`span.total`)
      //       let span = $(`span.${$(this).data('val')}`)
      //       $(spanT).text(Number($(spanT).text()) + 1)
      //       $(span).text(Number($(span).text()) + 1)
      //       let res = actionAjax(data)
      //       $(this).parent().html(`<div style="width: 100%;text-align: center;">
      //       <h4>Ваш голос принят!</h4>
      //       <p>Спасибо за участие в голосовании!</p>
      //       </div>`)
      //     });
      //   },
      // }
    );

    for (var i = 0; i < obj.length; i++) {
      data.push(obj[i].coords)
      Placemark[i] = new ymaps.Placemark(obj[i].coords, {
        id: obj[i].id,
        address: obj[i].address,
        coords: obj[i].coords,
        iconContent: "<div class='marker-circ'></div>",
      }, { //Ниже некоторые параметры точки и балуна
        balloonContentLayout: myBalloonLayout,
        balloonOffset: [5, 0],
        balloonCloseButton: true,
        balloonMinWidth: 450,
        balloonMaxWidth: 450,
        balloonMinHeught: 150,
        balloonMaxHeught: 200,
        iconImageHref: '/img/map-a.png', //Путь к картинке точки
        iconImageSize: [50, 70],
        iconImageOffset: [-25, -65],
        iconLayout: 'default#imageWithContent',
        iconactive: '/img/map-a.png' //Путь к картинке точки при наведении курсора мыши
      });
      
      //Добавляем маркер (точку) через кластер
      if(param == 'object_map'){
        myClusterer.add(Placemark[i]);
      }
    }

    
    var heatmap = new ymaps.Heatmap(data, {
        // Радиус влияния.
        radius: 15,
        // Нужно ли уменьшать пиксельный размер точек при уменьшении зума. False - не нужно.
        dissipating: false,
        // Прозрачность тепловой карты.
        opacity: 0.9,
        // Прозрачность у медианной по весу точки.
        intensityOfMidpoint: 0.5,
        // JSON описание градиента.
        gradient: {
            0.1: 'rgba(46, 204, 113,0.7)',
            0.3: 'rgba(243, 156, 18,0.8)',
            0.7: 'rgba(234, 72, 58, 0.9)',
            1.0: 'rgba(162, 36, 25, 1)'
        }
    });
    myMap.events.add('click', function(e) {
      let coords = e.get('coords');
      
      // Если метка уже создана – просто передвигаем ее.
      if (myPlacemark) {
          myPlacemark.geometry.setCoordinates(coords);
          getAddress(coords).then(res=>{
            let object = {address: res, coords}
            addObject(object)
          })
      }
      // Если нет – создаем.
      else {
          myPlacemark = createPlacemark(coords);
          myMap.geoObjects.add(myPlacemark);
          // Слушаем событие окончания перетаскивания на метке.
          myPlacemark.events.add('dragend', function() {
            getAddress(myPlacemark.geometry.getCoordinates());
          });
          getAddress(coords).then(res=>{
            let object = {address: res, coords}
            addObject(object)
          })
      }
    });



   // Создание метки.
   function createPlacemark(coords) {
      return new ymaps.Placemark(coords, {
        iconCaption: 'поиск...'
      }, {
        preset: 'islands#violetDotIconWithCaption',
        draggable: true
      });
    }
    // Определяем адрес по координатам (обратное геокодирование).
    function getAddress(coords) {
      return new Promise((resolve, reject)=>{
        myPlacemark.properties.set('iconCaption', 'поиск...');
        ymaps.geocode(coords)
        .then(function(res) {
          let firstGeoObject = res.geoObjects.get(0);
          myPlacemark.properties
          .set({
            // Формируем строку с данными об объекте.
            iconCaption: [
              // Название населенного пункта или вышестоящее административно-территориальное образование.
              firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
              // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
              firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
            ].filter(Boolean).join(', '),
            // В качестве контента балуна задаем строку с адресом объекта.
            balloonContent: firstGeoObject.getAddressLine()
          });
          resolve(firstGeoObject.getAddressLine())
        })
        .catch(err=>reject(err))
      })
    }
    if(param == 'heat_map'){
      heatmap.setMap(myMap);
    }
    
    //Добавление кластеры на карту
    myMap.geoObjects.add(myClusterer);
    //Запрещаем изменение размеров карты по скролу мыши
    // myMap.behaviors.disable("scrollZoom");

});

}
let mapParamBtn = document.querySelectorAll('.actions_btn')
mapParamBtn.forEach(btn=>{
  btn.addEventListener('click', function(e){
      myMap.destroy()
      getObject().then(res=>{
        initMaps(res.result, e.target.dataset.map)
      })
  })
})