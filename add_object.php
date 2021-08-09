<?
  $result = array('success'=> false);
  function addObjects($coords, $address){
    $file = $_SERVER["DOCUMENT_ROOT"] . "/objects.json";
    $current = json_decode(file_get_contents($file, true));
    $array = array(
      'address' => $address,
      'coords' => [floatval($coords[0]), floatval($coords[1])],
      'id' => count($current) > 0 ? count($current) + 1 : 1,
    );
    $current[] = $array;
    file_put_contents($file, json_encode($current));
  }
  function getObjects(){
    $file = $_SERVER["DOCUMENT_ROOT"] . "/objects.json";
    return json_decode(file_get_contents($file, true));
  }

  if($_REQUEST['action'] == 'add'){
    $coords = explode(',', $_REQUEST['coords']);
    $result['result'] =  addObjects($coords, $_REQUEST['address']);
    $result['success'] = true;
  }else{
    $result['success'] = false;
  }
  if($_REQUEST['action'] = 'get'){
    $result['result'] = getObjects();
    $result['success'] = true;
  }else{
    $result['success'] = false;
  }

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
echo json_encode($result);
?>