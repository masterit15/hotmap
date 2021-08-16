<?
  $result = array('success'=> false);
  function addObjects($data){
    $coords = explode(',', $data['coords']);
    $file = $_SERVER["DOCUMENT_ROOT"] . "/api/objects.json";
    $current = json_decode(file_get_contents($file, true));
    $array = array(
      'address' => $data['address'],
      'color' => $data['color'],
      'catId' => $data['catId'],
      'status' => 'Не обработан',
      'title' => $data['title'],
      'description' => $data['description'],
      'statusId' => 15,
      'cat' => $data['cat'],
      'icon' => $data['icon'],
      'coords' => [floatval($coords[0]), floatval($coords[1])],
      'createDate'=> date('d-m-Y H:m:s'),
      'id' => count($current) > 0 ? count($current) + 1 : 1,
    );
    $current[] = $array;
    
    file_put_contents($file, json_encode($current));
  }
  function getObjects(){
    $file = $_SERVER["DOCUMENT_ROOT"] . "/api/objects.json";
    return json_decode(file_get_contents($file, true));
  }
  function getRaion(){
    $file = $_SERVER["DOCUMENT_ROOT"] . "/api/object_ray.json";
    return json_decode(file_get_contents($file, true));
  }
  
  if($_REQUEST['action'] == 'add'){
    $result['post'] = $_POST;
    $result['result'] =  addObjects($_POST);
    $result['success'] = true;
  }else{
    $result['success'] = false;
  }
  if($_REQUEST['action'] = 'get'){
    $result['result']['objects'] = getObjects();
    $result['result']['raion'] = getRaion();
    $result['success'] = true;
  }else{
    $result['success'] = false;
  }

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
echo json_encode($result);
?>