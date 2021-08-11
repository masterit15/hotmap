<?require($_SERVER["DOCUMENT_ROOT"]."/app/header.php");?>
<div id="map"></div>
  <div class="param_actions">
    <button class="actions_btn" data-map="heat_map">Тепловая карта</button>
    <button class="actions_btn" data-map="object_map">Карта объектов</button>
    <button class="actions_btn" data-map="raion_map">Карта районов</button>
  </div>
  <div id="filter">
    <div class="group">
      <input type="text" name="name">
      <label>По названию</label>
    </div>
  </div>
<?require($_SERVER["DOCUMENT_ROOT"]."/app/footer.php");?>
