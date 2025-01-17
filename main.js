
// dla map
//wszystko jest liczone od prawej

class Point{
    id;
    countOfBomb;
    isBomb;
    isShown;
    isFlag;
}
var objects = [];
var lost = false;

var xCount = 10;
var yCount = 10;
var countOfBombs = 10;
var map = new Array(xCount);
for (var i = 0; i < map.length; i++) {
    map[i] = new Array(yCount);
}

var camera, scene, renderer;

camera = new THREE.PerspectiveCamera( 200, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.z = 3;

scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function init() {
    const texture = getTexture("texture9");
    var distance = 1.1;
    for(var i = 0; i < xCount; i++)
    {
        for(var j = 0; j < yCount; j++)
        {
            map[i][j] = new Point();
            map[i][j].countOfBomb = 0;
            map[i][j].isShown = false;
            map[i][j].isBomb = false;
            map[i][j].isFlag = false;
        }
    }
    var tmpCountofBombs = countOfBombs;
    while(tmpCountofBombs > 0)
    {
        let i = getRandomInt(0, xCount );
        let j = getRandomInt(0, yCount )
        if(map[i][j].isBomb != true)
        {
            map[i][j].isBomb = true;
            tmpCountofBombs--;
        }
    }

    SetCount();
    //initial offset so does not start in middle.
    let widthOfOnePlane = 1;
    let xOffset =  - (xCount * widthOfOnePlane + (xCount - 1) * distance) / 4.5;
    let yOffset = -13;
    for(var i = 0; i < xCount; i++){
        for(var j = 0; j < yCount; j++){
            var geometry = new THREE.PlaneGeometry();
            let material = new THREE.MeshBasicMaterial( {map: getTexture("texture9")});
            var mesh  = new THREE.Mesh(geometry, material);
            map[i][j].id = geometry.uuid;
            mesh.position.x = distance * i + xOffset;
            mesh.position.y = distance * j + yOffset;
            scene.add(mesh);
            objects.push(mesh);
        }
    };

}

function animate() {

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    if(!AnyObjectLeft())
    {
        var geometry = new THREE.PlaneGeometry(10, 2);
        let materialWin = new THREE.MeshBasicMaterial( {map: getTexture("win")});
        var mesh  = new THREE.Mesh(geometry, materialWin);
        mesh.position.x = 0.5;
        mesh.position.y = 2;
        scene.add(mesh);
        ShowAllValues();
    }
}
document.addEventListener( 'mousedown', onDocumentMouseDown, false );

var raycaster = new THREE.Raycaster(); // create once
var mouse = new THREE.Vector2(); // create once

function onDocumentMouseDown( event ) {
    if(lost) return;
    mouse.x = ( (event.clientX  - 3)/ renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( (event.clientY - 75) / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects(scene.children);
    
    if ( intersects.length > 0 )
    {
        var faceIndex = intersects[0].faceIndex;
        var obj = intersects[0].object;
        let mapObject;
        for(var i = 0; i < xCount; i++){
            for(var j = 0; j < yCount; j++){
                if(map[i][j].id == obj.geometry.uuid)
                {
                    mapObject = map[i][j];
                    break;
                }
            }
        };
        if(mapObject.isFlag == true)
        {
            obj.material = GetMaterial("texture9");
            mapObject.isFlag = false;
            return;
        }
        if(event.button == 0)
        {
            mapObject.isShown = true;
            let material = GetRightMaterial(mapObject);
            if(mapObject.isBomb == true)
            {
                var geometry = new THREE.PlaneGeometry(10, 2);
                let materialLost = new THREE.MeshBasicMaterial( {map: getTexture("lost")});
                var mesh  = new THREE.Mesh(geometry, materialLost);
                mesh.position.x = 0.5;
                mesh.position.y = 2;
                scene.add(mesh);
                lost = true;
                ShowAllValues();
            }

            obj.material = material;
        }
        if(event.button == 2)
        {
            mapObject.isFlag = true;
            obj.material = GetMaterial("texture11");
        }
    
    }
}

function SetCount()
{
    //prawy górny brzeg
    if(map[0][1].isBomb == true)
        map[0][0].countOfBomb++;
    if(map[1][1].isBomb == true)
        map[0][0].countOfBomb++;
    if(map[1][0].isBomb == true)
        map[0][0].countOfBomb++;

    //gorny brzeg
    for(var i = 1; i < xCount - 1; i++)
    {
        if(map[i - 1][0].isBomb == true)
            map[i][0].countOfBomb++;
        if(map[i - 1][1].isBomb == true)
            map[i][0].countOfBomb++;
        if(map[i][1].isBomb == true)
            map[i][0].countOfBomb++;
        if(map[i + 1][1].isBomb == true)
            map[i][0].countOfBomb++;
        if(map[i + 1][0].isBomb == true)
            map[i][0].countOfBomb++;
    }
    //lewy gorny brzeg
    if(map[xCount - 2][0].isBomb == true)
        map[xCount - 1][0].countOfBomb++;
    if(map[xCount - 2][1].isBomb == true)
        map[xCount - 1][0].countOfBomb++;
    if(map[xCount - 1][1].isBomb == true)
        map[xCount - 1][0].countOfBomb++;

    // brzeg prawy
    for(var j = 1; j < yCount - 1; j++)
    {
        if(map[0][j - 1].isBomb == true)
            map[0][j].countOfBomb++;
        if(map[1][j - 1].isBomb == true)
            map[0][j].countOfBomb++;
        if(map[1][j].isBomb == true)
            map[0][j].countOfBomb++;
        if(map[1][j + 1].isBomb == true)
            map[0][j].countOfBomb++;
        if(map[0][j + 1].isBomb == true)
            map[0][j].countOfBomb++;
    }
    //lewy brzeg
    for(var j = 1; j < yCount - 1; j++)
    {
        if(map[xCount - 1][j - 1].isBomb == true)
            map[xCount - 1][j].countOfBomb++;
        if(map[xCount - 2][j - 1].isBomb == true)
            map[xCount - 1][j].countOfBomb++;
        if(map[xCount - 2][j].isBomb == true)
            map[xCount - 1][j].countOfBomb++;
        if(map[xCount - 2][j + 1].isBomb == true)
            map[xCount - 1][j].countOfBomb++;
        if(map[xCount - 1][j + 1].isBomb == true)
            map[xCount - 1][j].countOfBomb++;
    }

    //lewy dolny rog
    if(map[xCount - 1][yCount - 2].isBomb == true)
        map[xCount - 1][yCount - 1].countOfBomb++;
    if(map[xCount - 2][yCount - 2].isBomb == true)
        map[xCount - 1][yCount - 1].countOfBomb++;
    if(map[xCount - 2][yCount - 1].isBomb == true)
        map[xCount - 1][yCount - 1].countOfBomb++;

    //dolny brzeg
    for(var i = 1; i < xCount - 1; i++)
    {
        if(map[i - 1][yCount - 1].isBomb == true)
            map[i][yCount - 1].countOfBomb++;
        if(map[i - 1][yCount - 2].isBomb == true)
            map[i][yCount - 1].countOfBomb++;
        if(map[i][yCount - 2].isBomb == true)
            map[i][yCount - 1].countOfBomb++;
        if(map[i + 1][yCount - 2].isBomb == true)
            map[i][yCount - 1].countOfBomb++;
        if(map[i + 1][yCount - 1].isBomb == true)
            map[i][yCount - 1].countOfBomb++;
    }
    //prawy dolny rog
    if(map[1][yCount - 2].isBomb == true)
        map[0][yCount - 1].countOfBomb++;
    if(map[1][yCount - 1].isBomb == true)
        map[0][yCount - 1].countOfBomb++;
    if(map[0][yCount - 2].isBomb == true)
        map[0][yCount - 1].countOfBomb++;

    //glowna petla - srodek
    for(var i = 1; i < xCount - 1; i++)
    {
        for(var j = 1; j < yCount - 1; j++)
        {
            if(map[i - 1][j - 1].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i][j - 1].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i + 1][j - 1].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i + 1][j].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i + 1][j + 1].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i][j + 1].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i - 1][j + 1].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
            if(map[i - 1][j].isBomb == true)
            {
                map[i][j].countOfBomb++;
            }
        }
    }
}

function getTexture(value)
{
    return new THREE.TextureLoader().load('textures/' + value + ".png", undefined, undefined, (err) =>
    {
            console.error(err);
    });
}

function GetMaterial(value)
{
    var texture = getTexture(value);
    return new THREE.MeshBasicMaterial( {map: texture});
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function GetRightMaterial(mapObject)
{
    var material;
    if(mapObject.countOfBomb == 0)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture0")});
    if(mapObject.countOfBomb == 1)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture1")});
    if(mapObject.countOfBomb == 2)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture2")});
    if(mapObject.countOfBomb == 3)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture3")});
    if(mapObject.countOfBomb == 4)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture4")});
    if(mapObject.countOfBomb == 5)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture5")});
    if(mapObject.countOfBomb == 6)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture6")});
    if(mapObject.countOfBomb == 7)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture7")});
    if(mapObject.countOfBomb == 8)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture8")});
    if(mapObject.countOfBomb == 9)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture9")});
    if(mapObject.isBomb == true)
        material = new THREE.MeshBasicMaterial( {map: getTexture("texture10")});
    return material;
}
function ShowAllValues()
{
    for(var i = 0; i < xCount; i++)
    {
        for(var j = 0; j < yCount; j++)
        {
            let mesh = objects.filter(object => object.geometry.uuid == map[i][j].id)[0]
            let material = GetRightMaterial(map[i][j]);
            mesh.material = material;
        }
    }
}

function AnyObjectLeft()
{
    let isAnyLeft = false;
    for(var i = 0; i < xCount; i++)
    {
        for(var j = 0; j < yCount; j++)
        {
            if(map[i][j].isBomb == false && (map[i][j].isShown == false || map[i][j].isFlag == true))
            {
                isAnyLeft = true;
                break;
            }
        }
        if(isAnyLeft == true)
            break;
    }
    return isAnyLeft;
}
function ClearScene()
{
    scene.remove.apply(scene, scene.children);
    lost = false;
    init();
    animate();
}
function restartGame()
{
    ClearScene();
}
function easyLevel()
{
    SetGlobalVariables(4,4,2);
    ClearScene();
}

function middleLevel()
{
    SetGlobalVariables(8,8,10);
    ClearScene();
}

function highLevel()
{
    SetGlobalVariables(12,12,25);
    ClearScene();
}

function SetGlobalVariables(x, y, bombs)
{
    countOfBombs = bombs;
    xCount = x;
    yCount = y;
    map = new Array(xCount);
    for (var i = 0; i < map.length; i++) {
        map[i] = new Array(yCount);
    }
}
        