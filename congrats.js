var teximg = [];
var texSrc = ["assets/yeah.jpg"];
var loadTexs = 0;
var gl;
var prog;

var angle = 0;

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

    alert("Erro de compilaÃ§Ã£o: " + gl.getShaderInfoLog(shader));

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
        setTimeout(() => backToGame(), 5000);
        congrats();
    }
}

function backToGame() {
    window.location.href = "index.html";
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
        gl.clearColor(0, 1, 1, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

    }
}

function configScene() {
    //Define coordenadas dos triÃ¢ngulos
    var coordTriangles = new Float32Array([
        //Quad 1
         0.5, -0.5, -0.5, 0.0, 0.0,
        -0.5, -0.5, -0.5, 0.0, 1.0,
        -0.5,  0.5, -0.5, 1.0, 1.0,
         0.5,  0.5, -0.5, 1.0, 0.0,
         0.5, -0.5, -0.5, 0.0, 0.0,

        //Quad 2
        -0.5,  0.5, -0.5, 1.0, 1.0,
        -0.5, -0.5, -0.5, 1.0, 0.0,
        -0.5, -0.5,  0.5, 0.0, 0.0,
        -0.5,  0.5,  0.5, 0.0, 1.0,
        -0.5,  0.5, -0.5, 1.0, 1.0,

        //Quad 3
        -0.5, -0.5,  0.5, 1.0, 1.0,
        -0.5, -0.5, -0.5, 1.0, 0.0,
         0.5, -0.5, -0.5, 0.0, 0.0,
         0.5, -0.5,  0.5, 0.0, 1.0,
        -0.5, -0.5,  0.5, 1.0, 1.0,

        //Quad 4
         0.5, 0.5, -0.5, 0.0, 0.0,
        -0.5, 0.5, -0.5, 0.0, 1.0,
        -0.5, 0.5,  0.5, 1.0, 1.0,
         0.5, 0.5,  0.5, 1.0, 0.0,
         0.5, 0.5, -0.5, 0.0, 0.0,

        //Quad 5
        -0.5,  0.5, 0.5, 0.0, 0.0,
        -0.5, -0.5, 0.5, 0.0, 1.0,
         0.5, -0.5, 0.5, 1.0, 1.0,
         0.5,  0.5, 0.5, 1.0, 0.0,
        -0.5,  0.5, 0.5, 0.0, 0.0,

        //Quad 6
        0.5, -0.5,  0.5, 1.0, 1.0,
        0.5, -0.5, -0.5, 1.0, 0.0,
        0.5,  0.5, -0.5, 0.0, 0.0,
        0.5,  0.5,  0.5, 0.0, 1.0,
        0.5, -0.5,  0.5, 1.0, 1.0,
    ]);

    //Cria buffer na GPU e copia coordenadas para ele
    var bufPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPtr);
    gl.bufferData(gl.ARRAY_BUFFER, coordTriangles, gl.STATIC_DRAW);

    //Pega ponteiro para o atributo "position" do vertex shader
    var positionPtr = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(positionPtr);
    //Especifica a cópia dos valores do buffer para o atributo
    gl.vertexAttribPointer(positionPtr,
        3,          //quantidade de dados em cada processamento
        gl.FLOAT,   //tipo de cada dado (tamanho)
        false,      //nÃ£o normalizar
        5 * 4,      //tamanho do bloco de dados a processar em cada passo
                    //0 indica que o tamanho do bloco Ã© igual a tamanho
                    //lido (2 floats, ou seja, 2*4 bytes = 8 bytes)
        0         //salto inicial (em bytes)
    );

    var texcoordPtr = gl.getAttribLocation(prog, "texCoord");
    gl.enableVertexAttribArray(texcoordPtr);
    //Especifica a cópia dos valores do buffer para o atributo
    gl.vertexAttribPointer(texcoordPtr,
        2,        //quantidade de dados em cada processamento
        gl.FLOAT, //tipo de cada dado (tamanho)
        false,    //nÃ£o normalizar
        5 * 4,      //tamanho do bloco de dados a processar em cada passo
        //0 indica que o tamanho do bloco Ã© igual a tamanho
        //lido (2 floats, ou seja, 2*4 bytes = 8 bytes)
        3 * 4       //salto inicial (em bytes)
    );

    var tex0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[0]);
}

function createPerspective(fovy, aspect, near, far) {
    fovy = fovy * Math.PI / 250.0;

    var fy = 1 / math.tan(fovy / 2.0);
    var fx = fy / aspect;
    var B = -2 * far * near / (far - near);
    var A = -(far + near) / (far - near);

    var proj = math.matrix(
        [[fx, 0.0, 0.0, 0.0],
        [0.0, fy, 0.0, 0.0],
        [0.0, 0.0, A, B],
        [0.0, 0.0, -1.0, 0.0]]
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

    var mov = math.matrix([[1, 0, 0, -pos[0]],
    [0, 1, 0, -pos[1]],
    [0, 0, 1, -pos[2]],
    [0, 0, 0, 1]]);

    var cam = math.multiply(mt, mov);

    return cam;
}

function congrats() {
    var mproj = createPerspective(20, gl.canvas.width / gl.canvas.height, 1, 50);
    var cam = createCamera([7, 7, 7], [0, 0, 0], [7, 8, 7]);

    var tz = math.matrix(
        [[1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, -5.0],
        [0.0, 0.0, 0.0, 1.0]]
    );

    var matrotZ = math.matrix(
        [[Math.cos(angle * Math.PI / 180.0), -Math.sin(angle * Math.PI / 180.0), 0.0, 0.0],
        [Math.sin(angle * Math.PI / 180.0), Math.cos(angle * Math.PI / 180.0), 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]]
    );

    var matrotY = math.matrix(
        [[Math.cos(angle * Math.PI / 180.0), 0.0, -Math.sin(angle * Math.PI / 180.0), 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [Math.sin(angle * Math.PI / 180.0), 0.0, Math.cos(angle * Math.PI / 180.0), 0.0],
        [0.0, 0.0, 0.0, 1.0]]
    );

    var matrotX = math.matrix(
        [[1.0, 0.0, 0.0, 0.0],
        [0.0, Math.cos(angle * Math.PI / 180.0), -Math.sin(angle * Math.PI / 180.0), 0.0],
        [0.0, Math.sin(angle * Math.PI / 180.0), Math.cos(angle * Math.PI / 180.0), 0.0],
        [0.0, 0.0, 0.0, 1.0]]
    );

    var transforma = math.multiply(matrotY, matrotX);
    transforma = math.multiply(matrotZ, transforma);
    transforma = math.multiply(cam, transforma);
    transforma = math.multiply(mproj, transforma);

    transforma = math.flatten(math.transpose(transforma))._data;

    transfPtr = gl.getUniformLocation(prog, "transf");
    gl.uniformMatrix4fv(transfPtr, false, transforma);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //desenha triângulos - executa shaders
    var texPtr = gl.getUniformLocation(prog, "tex");
    gl.uniform1i(texPtr, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 2, 3);

    gl.uniform1i(texPtr, 0);
    gl.drawArrays(gl.TRIANGLES, 5, 3);
    gl.drawArrays(gl.TRIANGLES, 7, 3);

    gl.uniform1i(texPtr, 0);
    gl.drawArrays(gl.TRIANGLES, 10, 3);
    gl.drawArrays(gl.TRIANGLES, 12, 3);

    gl.uniform1i(texPtr, 0);
    gl.drawArrays(gl.TRIANGLES, 15, 3);
    gl.drawArrays(gl.TRIANGLES, 17, 3);

    gl.uniform1i(texPtr, 0);
    gl.drawArrays(gl.TRIANGLES, 20, 3);
    gl.drawArrays(gl.TRIANGLES, 22, 3);

    gl.uniform1i(texPtr, 0);
    gl.drawArrays(gl.TRIANGLES, 25, 3);
    gl.drawArrays(gl.TRIANGLES, 27, 3);

    angle++;

    requestAnimationFrame(congrats);
}