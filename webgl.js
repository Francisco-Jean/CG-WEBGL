var teximg = [];
var texSrc = [
    "assets/gato.jpg",
    "assets/parede.jpg",
    "assets/grama.webp",
    "assets/sun.jpeg",
    "assets/telha.jpg",
    "assets/parede-porta.jpg"
];
var loadTexs = 0;
var gl;
var prog;

var angle = 0;

// Variáveis da câmera
var cameraPosition = [15, 7, 30];
var cameraSpeed = 1.5;
var cameraRotationX = 0;
var cameraRotationY = 0;
var lookAt = [145, 140, 140];

function getGL(canvas) {
    var gl = canvas.getContext("webgl");
    if (gl) return gl;

    gl = canvas.getContext("experimental-webgl");
    if (gl) return gl;

    alert("Contexto WebGL inexistente! Troque de navegador!");
    return false;
}

function createShader(gl, shaderType, shaderSrc) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        return shader;

    alert("Erro de compilação: " + gl.getShaderInfoLog(shader));

    gl.deleteShader(shader);
}

function createProgram(gl, vtxShader, fragShader) {
    var prog = gl.createProgram();
    gl.attachShader(prog, vtxShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (gl.getProgramParameter(prog, gl.LINK_STATUS))
        return prog;

    alert("Erro de linkagem: " + gl.getProgramInfoLog(prog));

    gl.deleteProgram(prog);
}

function init() {
    for (i = 0; i < texSrc.length; i++) {
        teximg[i] = new Image();
        teximg[i].src = texSrc[i];
        teximg[i].onload = function () {
            loadTexs++;
            loadTextures();
        }
    }
}

function loadTextures() {
    if (loadTexs == texSrc.length) {
        initGL();
        configScene();
        draw();
    }
}

function initGL() {

    var canvas = document.getElementById("glcanvas1");

    gl = getGL(canvas);
    if (gl) {
        //Inicializa shaders
        var vtxShSrc = document.getElementById("vertex-shader").text;
        var fragShSrc = document.getElementById("frag-shader").text;

        var vtxShader = createShader(gl, gl.VERTEX_SHADER, vtxShSrc);
        var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShSrc);
        prog = createProgram(gl, vtxShader, fragShader);

        gl.useProgram(prog);

        //Inicializa área de desenho: viewport e cor de limpeza; limpa a tela
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.4, 0.6, 0.7, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

    }
}


function configScene() {
    //Define coordenadas dos triângulos
    var coordTriangles = new Float32Array([
        //Piso
         1000, 0, 1000, 1.0, 1.0,
         1000, 0, 0.0 , 1.0, 0.0,
        -1000, 0, 0.0 , 0.0, 0.0,
        -1000, 0, 1000, 0.0, 1.0,
         1000, 0, 1000, 1.0, 1.0,

         // Sol
         265.0,  240.0, 240.0, 0.0, 0.0,
         240.0,  240.0, 240.0, 0.0, 1.0,
         240.0,  265.0, 240.0, 1.0, 1.0,
         265.0,  265.0, 240.0, 1.0, 0.0,
         265.0,  240.0, 240.0, 0.0, 0.0,

         240.0,  265.0, 240.0, 1.0, 1.0,
         240.0,  240.0, 240.0, 1.0, 0.0,
         240.0,  240.0, 265.0, 0.0, 0.0,
         240.0,  265.0, 265.0, 0.0, 1.0,
         240.0,  265.0, 240.0, 1.0, 1.0,

         240.0,  240.0, 265.0, 1.0, 1.0,
         240.0,  240.0, 240.0, 1.0, 0.0,
         265.0,  240.0, 240.0, 0.0, 0.0,
         265.0,  240.0, 265.0, 0.0, 1.0,
         240.0,  240.0, 265.0, 1.0, 1.0,

         265.0,  265.0, 240.0, 0.0, 0.0,
         240.0,  265.0, 240.0, 0.0, 1.0,
         240.0,  265.0, 265.0, 1.0, 1.0,
         265.0,  265.0, 265.0, 1.0, 0.0,
         265.0,  265.0, 240.0, 0.0, 0.0,

         240.0,  265.0, 265.0, 0.0, 0.0,
         240.0,  240.0, 265.0, 0.0, 1.0,
         265.0,  240.0, 265.0, 1.0, 1.0,
         265.0,  265.0, 265.0, 1.0, 0.0,
         240.0,  265.0, 265.0, 0.0, 0.0,

         265.0,  240.0, 265.0, 1.0, 1.0,
         265.0,  240.0, 240.0, 1.0, 0.0,
         265.0,  265.0, 240.0, 0.0, 0.0,
         265.0,  265.0, 265.0, 0.0, 1.0,
         265.0,  240.0, 265.0, 1.0, 1.0,

        // Casa 1
        10,  0, 10, 1.0, 1.0,
        10, 10, 10, 1.0, 0.0,
        10, 10,  0, 0.0, 0.0,
        10,  0,  0, 0.0, 1.0,
        10,  0, 10, 1.0, 1.0,

        20, 10, 10, 0.0, 0.0,
        20,  0, 10, 0.0, 1.0,
        20,  0,  0, 1.0, 1.0,
        20, 10,  0, 1.0, 0.0,
        20, 10, 10, 0.0, 0.0,

        20, 10,  0, 0.0, 0.0,
        20,  0,  0, 0.0, 1.0,
        10,  0,  0, 1.0, 1.0,
        10, 10,  0, 1.0, 0.0,
        20, 10,  0, 0.0, 0.0,

        20,  0, 10, 1.0, 1.0,
        20, 10, 10, 1.0, 0.0,
        10, 10, 10, 0.0, 0.0,
        10,  0, 10, 0.0, 1.0,
        20,  0, 10, 1.0, 1.0,

        // Teto esquerda
        10, 10, 10, 1.0, 1.0,
        15, 12, 10, 1.0, 0.0,
        15, 12,  0, 0.0, 0.0,
        10, 10,  0, 0.0, 1.0,
        10, 10, 10, 1.0, 1.0,
        // Teto direita
        15, 12, 10, 0.0, 0.0,
        20, 10, 10, 0.0, 1.0,
        20, 10,  0, 1.0, 1.0,
        15, 12,  0, 1.0, 0.0,
        15, 12, 10, 0.0, 0.0,
        // Teto frente
        20,  10, 10, 0.0, 0.0,
        15,  12, 10, 0.0, 1.0,
        15,  12, 10, 1.0, 1.0,
        10,  10, 10, 1.0, 0.0,
        20,  10, 10, 0.0, 0.0,
        // Teto trás
        10, 10,  0, 0.0, 0.0,
        15, 12,  0, 0.0, 1.0,
        15, 12,  0, 1.0, 1.0,
        20, 10,  0, 1.0, 0.0,
        10, 10,  0, 0.0, 0.0,

    ]);

    //Cria buffer na GPU e copia coordenadas para ele
    var bufPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPtr);
    gl.bufferData(gl.ARRAY_BUFFER, coordTriangles, gl.STATIC_DRAW);

    //Pega ponteiro para o atributo "position" do vertex shader
    var positionPtr = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(positionPtr);
    //Especifica a cópia dos valores do buffer para o atributo
    gl.vertexAttribPointer(
        positionPtr,
        3,        //quantidade de dados em cada processamento
        gl.FLOAT, //tipo de cada dado (tamanho)
        false,    //não normalizar
        5 * 4,      //tamanho do bloco de dados a processar em cada passo
        //0 indica que o tamanho do bloco é igual a tamanho
        //lido (2 floats, ou seja, 2*4 bytes = 8 bytes)
        0         //salto inicial (em bytes)
    );

    var texcoordPtr = gl.getAttribLocation(prog, "texCoord");
    gl.enableVertexAttribArray(texcoordPtr);
    //Especifica a cópia dos valores do buffer para o atributo
    gl.vertexAttribPointer(
        texcoordPtr,
        2,        //quantidade de dados em cada processamento
        gl.FLOAT, //tipo de cada dado (tamanho)
        false,    //não normalizar
        5 * 4,      //tamanho do bloco de dados a processar em cada passo
        //0 indica que o tamanho do bloco é igual a tamanho
        //lido (2 floats, ou seja, 2*4 bytes = 8 bytes)
        3 * 4       //salto inicial (em bytes)
    );

    //Iluminação =================================================================
    var normals = new Float32Array([
        //Quad 3
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
    ]);

    //Cria buffer na GPU e copia coordenadas para ele
    var bufnormalPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufnormalPtr);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    //Pega ponteiro para o atributo "position" do vertex shader
    var normalPtr = gl.getAttribLocation(prog, "normal");
    gl.enableVertexAttribArray(normalPtr);
    //Especifica a cópia dos valores do buffer para o atributo
    gl.vertexAttribPointer(
        normalPtr,
        3,        //quantidade de dados em cada processamento
        gl.FLOAT, //tipo de cada dado (tamanho)
        false,    //não normalizar
        0,      //tamanho do bloco de dados a processar em cada passo
        //0 indica que o tamanho do bloco é igual a tamanho
        //lido (2 floats, ou seja, 2*4 bytes = 8 bytes)
        0         //salto inicial (em bytes)
    );

    var lightDirectionPtr = gl.getUniformLocation(prog, "lightDirection");
    gl.uniform3fv(lightDirectionPtr, [0, 2, 10]);

    var lightColorPtr = gl.getUniformLocation(prog, "lightColor");
    gl.uniform3fv(lightColorPtr, [1, 1, 1]);

    var campos = [0, 0.25, 5];
    var lightp = [100.0, 1.0, 1.0];
    var lightposPtr = gl.getUniformLocation(prog, "lightpos");
    gl.uniform3fv(lightposPtr, lightp);

    var camposPtr = gl.getUniformLocation(prog, "campos");
    gl.uniform3fv(camposPtr, campos);
    // ============================================================================        					  


    //submeter textura para gpu
    var tex0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[0]);

    var tex1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[1]);

    tex2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[2]);
    gl.generateMipmap(gl.TEXTURE_2D);

    var tex3 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, tex3);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[3]);

    var tex4 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, tex4);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[4]);

    var tex5 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, tex5);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[5]);
}

function createPerspective(fovy, aspect, near, far) {
    fovy = fovy * Math.PI / 180.0;

    var fy = 1 / math.tan(fovy / 2.0);
    var fx = fy / aspect;
    var B = -2 * far * near / (far - near);
    var A = -(far + near) / (far - near);

    var proj = math.matrix(
        [
            [fx, 0.0, 0.0, 0.0],
            [0.0, fy, 0.0, 0.0],
            [0.0, 0.0, A, B],
            [0.0, 0.0, -1.0, 0.0]
        ]
    );

    return proj;
}

function createCamera(pos, target, up) {
    var zc = math.subtract(pos, target);
    zc = math.divide(zc, math.norm(zc));

    var yt = math.subtract(up, pos);
    yt = math.divide(yt, math.norm(yt));

    var xc = math.cross(yt, zc);
    xc = math.divide(xc, math.norm(xc));

    var yc = math.cross(zc, xc);
    yc = math.divide(yc, math.norm(yc));

    var mt = math.inv(math.transpose(math.matrix([xc, yc, zc])));

    mt = math.resize(mt, [4, 4], 0);
    mt._data[3][3] = 1;

    var mov = math.matrix(
        [
            [1, 0, 0, -pos[0]],
            [0, 1, 0, -pos[1]],
            [0, 0, 1, -pos[2]],
            [0, 0, 0, 1]
        ]
    );

    var cam = math.multiply(mt, mov);

    return cam;
}

var mproj;
var cam;
var transformaproj;
var transfprojPtr;

function updateViewMatrix() {
    mproj = createPerspective(45, gl.canvas.width / gl.canvas.height, 0.0001, 400000000000);
    cam = createCamera(cameraPosition, lookAt, [cameraPosition[0], cameraPosition[1] + 1, cameraPosition[2]]);

    transformaproj = math.multiply(mproj, cam);
    transformaproj = math.flatten(math.transpose(transformaproj))._data;

    transfprojPtr = gl.getUniformLocation(prog, "transfproj");
    gl.uniformMatrix4fv(transfprojPtr, false, transformaproj);
}

var mouseSensitivity = 0.2;
var cameraRotationX = 0;
var cameraRotationY = 0;

// Função para bloquear o cursor e habilitar a captura de movimento indefinido
function requestPointerLock() {
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
}

// Lida com o movimento do mouse quando o ponteiro está bloqueado
function handleMouseMove(event) {
    // "movementX" e "movementY" são mudanças no mouse, sem restrição de posição
    var deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    cameraRotationY += deltaX * mouseSensitivity;
    cameraRotationX -= deltaY * mouseSensitivity;

    // Limitar a rotação vertical para evitar virada completa
    cameraRotationX = Math.max(-100, Math.min(100, cameraRotationX));

    // Calcular a direção para onde a câmera deve olhar
    var forwardDirection = [
        Math.sin(cameraRotationY * Math.PI / 180.0),
        Math.sin(cameraRotationX * Math.PI / 180.0),
        -Math.cos(cameraRotationY * Math.PI / 180.0)
    ];

    // Atualizar o ponto para onde a câmera está olhando
    lookAt[0] = cameraPosition[0] + forwardDirection[0];
    lookAt[1] = cameraPosition[1] + forwardDirection[1];
    lookAt[2] = cameraPosition[2] + forwardDirection[2];

    updateViewMatrix();
}

// Ativar bloqueio do cursor ao clicar com o mouse
document.addEventListener('mousemove', function () {
    requestPointerLock();
});

// Adiciona o ouvinte de movimento do mouse
document.addEventListener('mousemove', handleMouseMove);

// Listener para verificar se o ponteiro foi bloqueado ou liberado
document.addEventListener('pointerlockchange', function () {
    if (document.pointerLockElement === document.body) {
        console.log("Pointer locked.");
    } else {
        console.log("Pointer unlocked.");
    }
});

function handleKeyDown(event) {
    var forwardDirection = [
        Math.sin(cameraRotationY * Math.PI / 180.0),
        0,
        -Math.cos(cameraRotationY * Math.PI / 180.0)
    ];

    var rightDirection = [
        Math.cos(cameraRotationY * Math.PI / 180.0),
        0,
        Math.sin(cameraRotationY * Math.PI / 180.0)
    ];

    if (event.key === "ArrowUp" || event.key === "w") {
        cameraPosition[0] += forwardDirection[0] * cameraSpeed;
        cameraPosition[2] += forwardDirection[2] * cameraSpeed;
    }
    if (event.key === "ArrowDown" || event.key === "s") {
        cameraPosition[0] -= forwardDirection[0] * cameraSpeed;
        cameraPosition[2] -= forwardDirection[2] * cameraSpeed;
    }
    if (event.key === "ArrowLeft" || event.key === "a") {
        cameraPosition[0] -= rightDirection[0] * cameraSpeed;
        cameraPosition[2] -= rightDirection[2] * cameraSpeed;
    }
    if (event.key === "ArrowRight" || event.key === "d") {
        cameraPosition[0] += rightDirection[0] * cameraSpeed;
        cameraPosition[2] += rightDirection[2] * cameraSpeed;
    }

    lookAt[0] = cameraPosition[0] + forwardDirection[0];
    lookAt[2] = cameraPosition[2] + forwardDirection[2];

    updateViewMatrix();
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("mousemove", handleMouseMove);

var angleX = 0;
var angleY = 0;
var angleZ = 0;

var angle = 0;
function draw() {
    updateViewMatrix();

    angleX += 0.1;
    angleY += 0.1;
    angleZ += 0.1;

    var matrotX = math.matrix([
        [1.0, 0.0, 0.0, 0.0],
        [0.0, Math.cos(angleX * Math.PI / 180.0), -Math.sin(angleX * Math.PI / 180.0), 0.0],
        [0.0, Math.sin(angleX * Math.PI / 180.0), Math.cos(angleX * Math.PI / 180.0), 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ]);

    var matrotY = math.matrix([
        [Math.cos(angleY * Math.PI / 180.0), 0.0, Math.sin(angleY * Math.PI / 180.0), 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [-Math.sin(angleY * Math.PI / 180.0), 0.0, Math.cos(angleY * Math.PI / 180.0), 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ]);

    var matrotZ = math.matrix([
        [Math.cos(angleZ * Math.PI / 180.0), -Math.sin(angleZ * Math.PI / 180.0), 0.0, 0.0],
        [Math.sin(angleZ * Math.PI / 180.0), Math.cos(angleZ * Math.PI / 180.0), 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ]);

    // var transforma = math.matrix([[1, 0, 0, 0],
    //                               [0, 1, 0, 0],
    //                               [0, 0, 1, 0],
    //                               [0, 0, 0, 1]]);

    // var transforma = math.matrix(
    //     [[Math.cos(angle * Math.PI / 180.0), -Math.sin(angle * Math.PI / 180.0), 0.0, 0.0],
    //     [Math.sin(angle * Math.PI / 180.0), Math.cos(angle * Math.PI / 180.0), 0.0, 0.0],
    //     [0.0, 0.0, 1.0, 0.0],
    //     [0.0, 0.0, 0.0, 1.0]]
    // );

    // var transforma = math.multiply(matrotY, matrotX); 
    // transforma = math.multiply(matrotZ, transforma);

    // var transformaproj = math.multiply(cam, transforma);
    // transformaproj = math.multiply(mproj, transformaproj);

    // transformaproj = math.flatten(math.transpose(transformaproj))._data;
    // var transfprojPtr = gl.getUniformLocation(prog, "transfproj");
    // gl.uniformMatrix4fv(transfprojPtr, false, transformaproj);

    // transforma = math.flatten(math.transpose(transforma))._data;
    // transfPtr = gl.getUniformLocation(prog, "transf");
    // gl.uniformMatrix4fv(transfPtr, false, transforma);
   

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //desenha triângulos - executa shaders
    var texPtr = gl.getUniformLocation(prog, "tex");
    // Chão
    gl.uniform1i(texPtr, 2); 
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 2, 3);

    // Sol
    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 5, 3);
    gl.drawArrays(gl.TRIANGLES, 7, 3);

    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 10, 3);
    gl.drawArrays(gl.TRIANGLES, 12, 3);

    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 15, 3);
    gl.drawArrays(gl.TRIANGLES, 17, 3);

    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 20, 3);
    gl.drawArrays(gl.TRIANGLES, 22, 3);

    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 25, 3);
    gl.drawArrays(gl.TRIANGLES, 27, 3);

    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 30, 3);
    gl.drawArrays(gl.TRIANGLES, 32, 3);

    // Casa
    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 35, 3);
    gl.drawArrays(gl.TRIANGLES, 37, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 40, 3);
    gl.drawArrays(gl.TRIANGLES, 42, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 45, 3);
    gl.drawArrays(gl.TRIANGLES, 47, 3);

    gl.uniform1i(texPtr, 5);
    gl.drawArrays(gl.TRIANGLES, 50, 3);
    gl.drawArrays(gl.TRIANGLES, 52, 3);

    // Teto

    gl.uniform1i(texPtr, 4);
    gl.drawArrays(gl.TRIANGLES, 55, 3);
    gl.drawArrays(gl.TRIANGLES, 57, 3);

    gl.uniform1i(texPtr, 4);
    gl.drawArrays(gl.TRIANGLES, 60, 3);
    gl.drawArrays(gl.TRIANGLES, 62, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 65, 3);
    gl.drawArrays(gl.TRIANGLES, 67, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 70, 3);
    gl.drawArrays(gl.TRIANGLES, 72, 3);

    angle += 0.1;

    requestAnimationFrame(draw);
}
