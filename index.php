<?require($_SERVER["DOCUMENT_ROOT"]."/app/header.php");?>
  <div id="map"></div>
  <div class="actions_param left">
    <button class="chart_btn"><i class="fas fa-chart-area"></i></button>
    <button class="message_btn"><i class="fas fa-envelope-open-text"></i></button>
  </div>
  <div class="actions_param right">
    <button class="actions_btn active" data-map="heat_map">Тепловая карта</button>
    <button class="actions_btn" data-map="object_map">Карта объектов</button>
    <button class="actions_btn" data-map="raion_map">Карта районов</button>
    <select name="cat" class="select" id="select_filter">
      <option value="#">По категории</option>
      <option value="1">ЖКХ</option>
      <option value="2">Мусор</option>
      <option value="3">Дороги</option>
      <option value="4">Незаконное строительство</option>
    </select>
  </div>
  <div class="chart chart-line">
      <canvas id="line-chart"></canvas>
  </div>
  <div class="chart chart-pie">
      <canvas id="pie-chart"></canvas>
  </div>
  <div class="actions_content"></div>
<?require($_SERVER["DOCUMENT_ROOT"]."/app/footer.php");?>
