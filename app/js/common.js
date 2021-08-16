var myPlacemark;
var myMap;
var Poligon;
var mapViewParam;
var myPieChart
var chartInstance
const { gsap } = require("gsap/all")
const tl = gsap.timeline()
// добавление объектов
function addObject(data) {
  $.ajax({
    url: '../api/api.php',
    method: 'POST',
    data: data,
    success: function (res) {
      if (res.success) {
        // console.log(result)
      }
    },
    error: function (err) {
      console.error(err);
    }
  })
}
// подгрузка всех объектов
function getObject() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '../api/api.php',
      method: 'POST',
      data: { action: 'get' },
      success: function (res) {
        if (res.success) {
          resolve(res)
        }
      },
      error: function (err) {
        reject(err)
      }
    })
  })
}
getObject().then(res => {
  Poligon = res.result.raion
  initMaps(res.result.objects)
  if(res.result.objects) initChart(res.result.objects)
})

function initMaps(obj, param = 'heat_map') {
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
      href: 'app/images/dist/map-classter.svg',
      size: [70, 100],
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
    if(obj){
    for (var i = 0; i < obj.length; i++) {
      data.push(obj[i].coords)
      // Создаём макет содержимого.
      MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="ballon_icon">$[properties.iconContent]</div>'
      ),
        Placemark[i] = new ymaps.Placemark(obj[i].coords, {
          id: obj[i].id,
          address: obj[i].address,
          coords: obj[i].coords,
          iconContent: `<i style="color: ${obj[i].color}" class="fas ${obj[i].icon}"></i>`,
          hintContent: obj[i].cat ? obj[i].cat : 'Прочее',
        }, { //Ниже некоторые параметры точки и балуна
          balloonContentLayout: myBalloonLayout,
          balloonOffset: [5, 0],
          balloonCloseButton: true,
          balloonMinWidth: 450,
          balloonMaxWidth: 450,
          balloonMinHeught: 150,
          balloonMaxHeught: 200,
          iconImageHref: 'app/images/dist/map-a-red.svg', //Путь к картинке точки
          iconImageSize: [70, 90],
          iconImageOffset: [-25, -65],
          iconLayout: 'default#imageWithContent',
          iconactive: 'app/images/dist/map-a-hover.svg', //Путь к картинке точки при наведении курсора мыши
          iconContentLayout: MyIconContentLayout // Макет содержимого.
        });

      //Добавляем маркер (точку) через кластер
      if (param == 'object_map') {
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
  }
    myMap.events.add('click', function (e) {
      let coords = e.get('coords');

      // Если метка уже создана – просто передвигаем ее.
      if (myPlacemark) {
        myPlacemark.geometry.setCoordinates(coords);
        getAddress(coords)
      }
      // Если нет – создаем.
      else {
        myPlacemark = createPlacemark(coords);
        myMap.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        myPlacemark.events.add('dragend', function () {
          getAddress(myPlacemark.geometry.getCoordinates());
        });
        getAddress(coords)
      }
    });
    
    if (param == 'raion_map') {
      Poligon.forEach(p => {
        let polygon = new ymaps.Polygon(p.coords
          , {
            hintContent: p.name
          }, {
          fillColor: p.color,
          // Делаем полигон прозрачным для событий карты.
          interactivityModel: 'default#transparent',
          strokeWidth: 2,
          opacity: 0.5
        });
        // 3. Добавляем полигон на карту
        myMap.geoObjects.add(polygon);
        myMap.setBounds(polygon.geometry.getBounds());
      })
    }


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
      myPlacemark.properties.set('iconCaption', 'поиск...');
      ymaps.geocode(coords)
        .then(function (res) {
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
          let data = {
            action: "add",
            address: firstGeoObject.getAddressLine(),
            coords: coords.toString()
          };
          let content = `<div class="form_add">
                          <div class="group">
                            <input type="text" name="address" value="${firstGeoObject.getAddressLine()}">
                            <label>Адрес</label>
                          </div>
                          <select name="cat" class="select" id="select_cat">
                            <option value="#" data-icon="fa-envelope" data-color="#000">Категория</option>
                            <option value="1" data-icon="fa-faucet" data-color="#3867d6">ЖКХ</option>
                            <option value="2" data-icon="fa-dumpster" data-color="#079992">Мусор</option>
                            <option value="3" data-icon="fa-road" data-color="#57606f">Дороги</option>
                            <option value="4" data-icon="fa-hard-hat" data-color="#fa8231">Незаконное строительство</option>
                          </select>
                          <div class="form_action">
                            <button type="submit" class="add">Добавить</button>
                            <button class="cancel">Отмена</button>
                          </div>
                        </div>`

          $('.actions_content').addClass('active').html(content)
          // $('.actions_content input[name="address"]').val(firstGeoObject.getAddressLine())
          $('#select_cat').select2({
            language: "ru",
            minimumResultsForSearch: -1
          })
          $('#select_cat').on('select2:select', function (e) {
            data.cat = $(this).find(`option[value="${$(this).val()}"]`).text()
            data.color = $(this).find(`option[value="${$(this).val()}"]`).data('color')
            data.icon = $(this).find(`option[value="${$(this).val()}"]`).data('icon')
            data.catId = Number($(this).val())
          });
          $('.actions_content button.add').on('click', function () {
            addObject(data)
            $('.actions_content').removeClass('active').html('content')
            myPlacemark = null
            myMap.destroy()
            getObject().then(res => {
              initMaps(res.result.objects, mapViewParam)
              if(res.result.objects) initChart(res.result.objects)
            })
          })
          $('.actions_content button.cancel').on('click', function () {
            $('.actions_content').removeClass('active')
            myMap.geoObjects.remove(myPlacemark);
            myPlacemark = null
          })
        })
    }
    if (param == 'heat_map') {
      heatmap.setMap(myMap);
    }

    //Добавление кластеры на карту
    myMap.geoObjects.add(myClusterer);
    //Запрещаем изменение размеров карты по скролу мыши
    // myMap.behaviors.disable("scrollZoom");

  });

}

$('#select_filter').select2({
  language: "ru",
  minimumResultsForSearch: -1
})
$('#select_filter').on('change', function () {
  myMap.destroy()
  getObject().then(res => {
    let objects = res.result.objects
    objects = objects.filter(object => Number(object.catId) == Number($(this).val()))
    initMaps(objects, mapViewParam)
    initChart(objects)
  })
})
$('.actions_btn').on('click', function () {
  $('.actions_btn').removeClass('active')
  $(this).addClass('active')
  myMap.destroy()
  mapViewParam = $(this).hasClass('active') ? $(this).data('map') : ''
  getObject().then(res => {
    initMaps(res.result.objects, mapViewParam)
    initChart(res.result.objects)
  })
})
function mountFormat(date){
  let mount = Number(date.split('-')[1].split('')[1]) == 1 ? 0 : Number(date.split('-')[1].split('')[1]) - 1
  return mount
}
function initChart(chartData){
  let  labels = [
    {mount: 'Январь', count: 0},
    {mount: 'Февраль', count: 0},
    {mount: 'Март', count: 0},
    {mount: 'Апрель', count: 0},
    {mount: 'Май', count: 0},
    {mount: 'Июнь', count: 0},
    {mount: 'Июль', count: 0},
    {mount: 'Август', count: 0},
    {mount: 'Сентябрь', count: 0},
    {mount: 'Октябрь', count: 0},
    {mount: 'Ноябрь', count: 0},
    {mount: 'Декабрь', count: 0},
  ]
  chartData.forEach(el => {
    labels[mountFormat(el.createDate)].count += 1
  });
  let dataCount = []
  labels.forEach(l=>{
    dataCount.push(l.count)
  })
  const chart = document.getElementById('line-chart').getContext('2d'),
        pie = document.getElementById('pie-chart').getContext('2d'),
    gradient = chart.createLinearGradient(0, 233, 0, 350);
    gradient.addColorStop(0, 'rgba(36, 180, 171, 0.3)');
    gradient.addColorStop(0.2, 'rgba(36, 180, 171, 0.2)');
    gradient.addColorStop(1, 'rgba(36, 180, 171, 0)');
  var data = {
    labels: [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ],
    datasets: [{
      label: 'Количество',
      backgroundColor: gradient,
      pointBackgroundColor: '#24b4ab',
      borderWidth: 3,
      borderColor: '#24b4ab',
      data: dataCount,
      min: 0
    }]
  };


  var options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      easing: 'easeInOutQuad',
      duration: 2000
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.1)',
          borderDash: [2, 2],
          lineWidth: 1
        }
      }],
      yAxes: [{
        ticks: {
          stepSize: 1
        },
        gridLines: {
          color: 'rgba(0,0,0,0.1)',
          borderDash: [2, 2],
          lineWidth: 1
        }
      }]
    },
    elements: {
      line: {
        tension: 0.5
      },
      arc: {
        backgroundColor: '#333'
      }
    },
    legend: {
      hidden: true,
      display: false
    },
    point: {
      // backgroundColor: 'white'
    },
    tooltips: {
      titleFontFamily: 'Open Sans',
      backgroundColor: 'rgba(255,255,255,0.5)',
      titleFontColor: '#333',
      bodyFontColor: '#333',
      caretSize: 15,
      cornerRadius: 3,
      xPadding: 15,
      yPadding: 15,
      custom: function(tooltipModel) {
        
      }
    }
  };
  chartInstance = new Chart(chart, {
    type: 'line',
    data: data,
    options: options
  });

  let  labelsPie = [
    {catId: 1, cat: "ЖКХ", count: 0},
    {catId: 2, cat: "Мусор", count: 0},
    {catId: 3, cat: "Дороги", count: 0},
    {catId: 4, cat: "Незаконное строительство", count: 0},

  ]
  chartData.forEach(el => {
    labelsPie.forEach((l, i, a)=>{
      if(el.catId == l.catId){
        labelsPie[i].count += 1
      }
    })
    
  });
  let dataCountPie = []
  labelsPie.forEach(l=>{
    dataCountPie.push(l.count)
  })
  let dataPie = {
    datasets: [{
        data: dataCountPie,
        backgroundColor: [
          '#0984e3',
          '#079992',
          '#57606f',
          '#fa8231',
      ]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
      'ЖКХ',
      'Мусор',
      'Дороги',
      'Незаконное строительство'
    ],
  }
  let optionsPie = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'left',
      labels: {
        
      }
    }
  }
  myPieChart = new Chart(pie,{
    type: 'pie',
    data: dataPie,
    options: optionsPie
});
}


$('.chart_btn').on('click', function() {
  $(this).toggleClass('active')
  if($(this).hasClass('active')){
    tl.to('.chart', { scale: 1, opacity: 1, duration: .5, stagger: 0.1, ease: "elastic" })
  }else{
    tl.to('.chart', { scale: 0, opacity: 0, duration: .5, stagger: 0.1, ease: "elastic" })
  }
})