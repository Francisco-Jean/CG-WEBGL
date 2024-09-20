var teximg = [];
var texSrc = [
    "assets/yeah.jpg",
    "assets/parede.jpg",
    "assets/chess.jpg",
    "assets/cubo.jpg",
    "assets/telha.jpg",
    "assets/parede-porta.jpg",
    "assets/taca.jpg",
    "assets/grama.webp",
    "assets/grama2.jpg",
    "assets/grama3.jpg",
];

var texGrama;
var loadTexs = 0;
var gl;
var prog;

var angle = 0;

var reached = false;

// Variáveis da câmera
var cameraPosition = [55, 7, 100];
var cameraSpeed = 1.5;
var cameraRotationX = 0;
var cameraRotationY = 0;
var lookAt = [55, 7, 0];

// Rotação de luz
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
        gl.clearColor(0.02, 0.02, 0.09, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

    }
}

function rotateVertices(vertices, angleX, angleY, angleZ) {
    const radiansX = angleX * Math.PI / 180.0;
    const radiansY = angleY * Math.PI / 180.0;
    const radiansZ = angleZ * Math.PI / 180.0;

    // Matrizes de rotação
    const matrotX = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, Math.cos(radiansX), -Math.sin(radiansX), 0.0],
        [0.0, Math.sin(radiansX), Math.cos(radiansX), 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ];

    const matrotY = [
        [Math.cos(radiansY), 0.0, Math.sin(radiansY), 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [-Math.sin(radiansY), 0.0, Math.cos(radiansY), 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ];

    const matrotZ = [
        [Math.cos(radiansZ), -Math.sin(radiansZ), 0.0, 0.0],
        [Math.sin(radiansZ), Math.cos(radiansZ), 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    ];

    // Função para multiplicar um vetor por uma matriz de rotação
    function multiplyMatrixAndPoint(matrix, point) {
        const [x, y, z] = point;
        const result = [
            matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z + matrix[0][3],
            matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z + matrix[1][3],
            matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z + matrix[2][3],
            matrix[3][0] * x + matrix[3][1] * y + matrix[3][2] * z + matrix[3][3]
        ];
        return result.slice(0, 3);  // Desconsidera o valor W, retornando (x, y, z)
    }

    // Calcula o centro do objeto
    let centerX = 0, centerY = 0, centerZ = 0;
    let numVertices = vertices.length / 5;

    for (let i = 0; i < vertices.length; i += 5) {
        centerX += vertices[i];
        centerY += vertices[i + 1];
        centerZ += vertices[i + 2];
    }

    centerX /= numVertices;
    centerY /= numVertices;
    centerZ /= numVertices;

    // Matriz de saída para armazenar os vértices rotacionados
    const rotatedVertices = [];

    // Para cada vértice na matriz, aplique as rotações
    for (let i = 0; i < vertices.length; i += 5) {
        // Translada o vértice para a origem
        const vertex = [vertices[i] - centerX, vertices[i + 1] - centerY, vertices[i + 2] - centerZ, 1.0];  // (x, y, z, 1.0)

        // Aplicar rotação em X, Y e Z
        let rotatedVertex = multiplyMatrixAndPoint(matrotX, vertex);
        rotatedVertex = multiplyMatrixAndPoint(matrotY, rotatedVertex);
        rotatedVertex = multiplyMatrixAndPoint(matrotZ, rotatedVertex);

        // Translada o vértice de volta para a posição original
        rotatedVertex[0] += centerX;
        rotatedVertex[1] += centerY;
        rotatedVertex[2] += centerZ;

        // Manter as coordenadas de textura inalteradas (os últimos dois elementos)
        rotatedVertices.push(rotatedVertex[0], rotatedVertex[1], rotatedVertex[2], vertices[i + 3], vertices[i + 4]);
    }

    return new Float32Array(rotatedVertices);
}

function multiplyMatrices(a, b) {
    var result = new Float32Array(16);
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            result[i * 4 + j] = 0;
            for (var k = 0; k < 4; k++) {
                result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    return result;
}

function createTranslationMatrix(tx, ty, tz) {
    return new Float32Array([
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1
    ]);
}

function createScaleMatrix(sx, sy, sz) {
    return new Float32Array([
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    ]);
}

function applyTransformation(vertices, transformationMatrix) {
    var transformedVertices = [];
    for (var i = 0; i < vertices.length; i += 5) {
        var x = vertices[i];
        var y = vertices[i + 1];
        var z = vertices[i + 2];
        var u = vertices[i + 3];
        var v = vertices[i + 4];

        var nx = transformationMatrix[0] * x + transformationMatrix[1] * y + transformationMatrix[2] * z + transformationMatrix[3];
        var ny = transformationMatrix[4] * x + transformationMatrix[5] * y + transformationMatrix[6] * z + transformationMatrix[7];
        var nz = transformationMatrix[8] * x + transformationMatrix[9] * y + transformationMatrix[10] * z + transformationMatrix[11];

        transformedVertices.push(nx, ny, nz, u, v);
    }
    return new Float32Array(transformedVertices);
}

function translateVertices(vertices, tx, ty, tz) {
    var translationMatrix = createTranslationMatrix(tx, ty, tz);

    return applyTransformation(vertices, translationMatrix);
}

function scaleVertices(vertices, escX, escY, escZ) {
    var centerX = 0, centerY = 0, centerZ = 0;
    var numVertices = vertices.length / 5;

    // Calcular o centro do vetor
    for (var i = 0; i < vertices.length; i += 5) {
        centerX += vertices[i];
        centerY += vertices[i + 1];
        centerZ += vertices[i + 2];
    }
    centerX /= numVertices;
    centerY /= numVertices;
    centerZ /= numVertices;

    // Criar matrizes de transformação
    var translationToOrigin = createTranslationMatrix(-centerX, -centerY, -centerZ);
    var scaleMatrix = createScaleMatrix(escX, escY, escZ);
    var translationBack = createTranslationMatrix(centerX, centerY, centerZ);

    // Combinar as matrizes de transformação na ordem correta
    var transformationMatrix = multiplyMatrices(translationBack, multiplyMatrices(scaleMatrix, translationToOrigin));

    // Aplicar a transformação aos vértices
    return applyTransformation(vertices, transformationMatrix);
}

function calculateNormals(vertices) {
    var normals = [];

    // Assumindo que os vértices são fornecidos em grupos de 5 para formar faces
    for (var i = 0; i < vertices.length; i += 25) {
        // Pegar os cinco vértices da face
        var v0 = [vertices[i], vertices[i + 1], vertices[i + 2]];
        var v1 = [vertices[i + 5], vertices[i + 6], vertices[i + 7]];
        var v2 = [vertices[i + 10], vertices[i + 11], vertices[i + 12]];
        var v3 = [vertices[i + 15], vertices[i + 16], vertices[i + 17]];
        var v4 = [vertices[i + 20], vertices[i + 21], vertices[i + 22]];

        // Calcular os vetores das arestas da face
        var edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
        var edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]; 
        var edge3 = [v3[0] - v0[0], v3[1] - v0[1], v3[2] - v0[2]];
        var edge4 = [v4[0] - v0[0], v4[1] - v0[1], v4[2] - v0[2]];

        // Calcular a normal usando o produto vetorial
        var normal = [
            edge1[1] * edge2[2] - edge1[2] * edge2[1] + edge2[1] * edge3[2] - edge2[2] * edge3[1] + edge3[1] * edge4[2] - edge3[2] * edge4[1] + edge4[1] * edge1[2] - edge4[2] * edge1[1],
            edge1[2] * edge2[0] - edge1[0] * edge2[2] + edge2[2] * edge3[0] - edge2[0] * edge3[2] + edge3[2] * edge4[0] - edge3[0] * edge4[2] + edge4[2] * edge1[0] - edge4[0] * edge1[2],
            edge1[0] * edge2[1] - edge1[1] * edge2[0] + edge2[0] * edge3[1] - edge2[1] * edge3[0] + edge3[0] * edge4[1] - edge3[1] * edge4[0] + edge4[0] * edge1[1] - edge4[1] * edge1[0]
        ];
            
        // Adicionar a normal para cada vértice da face
        for (var j = 0; j < 5; j++) {
            normals.push(normal[0], normal[1], normal[2]);
        }
    }

    return new Float32Array(normals);
}

var lightX = -10;
var sinal = 1.5;

var lightX2 = 120;
var sinal2 = -sinal;

function createBuffer() {

    // Configuração da luz

    var luzAmbientePtr = gl.getUniformLocation(prog, "luzAmbiente");
    gl.uniform3fv(luzAmbientePtr, [1, 1, 1]);

    var direction = [lightX, 0, 25];
    var lightDirectionPtr = gl.getUniformLocation(prog, "lightDirection");
    gl.uniform3fv(lightDirectionPtr, direction);
    
    var lightColorPtr = gl.getUniformLocation(prog, "lightColor");
    gl.uniform3fv(lightColorPtr, [0.8, 0.5, 0.0]);
    
    var lightp = [lightX, 15, direction[2]];
    var lightposPtr = gl.getUniformLocation(prog, "lightpos");
    gl.uniform3fv(lightposPtr, lightp);
    campos = [lightp[0], lightp[1], lightp[2]];
    var camposPtr = gl.getUniformLocation(prog, "campos");
    gl.uniform3fv(camposPtr, campos);

    lightX += sinal;

    if (lightX > 120 || lightX < -10) {
        sinal *= -1;

    }


    var direction = [lightX2, 0, 25];
    var lightDirectionPtr = gl.getUniformLocation(prog, "lightDirection2");
    gl.uniform3fv(lightDirectionPtr, direction);
    
    var lightColorPtr = gl.getUniformLocation(prog, "lightColor2");
    gl.uniform3fv(lightColorPtr, [0.5, 0.0, 0.7]);
    
    var lightp = [lightX2, 15, direction[2]];
    var lightposPtr = gl.getUniformLocation(prog, "lightpos2");
    gl.uniform3fv(lightposPtr, lightp);
    campos = [lightp[0], lightp[1], lightp[2]];
    var camposPtr = gl.getUniformLocation(prog, "campos2");
    gl.uniform3fv(camposPtr, campos);

    lightX2 += sinal2;

    if (lightX2 > 120 || lightX2 < -10) {
        sinal2 *= -1;

    }

    // Configuração dos objetos
    var repeticoes = 100;

    var piso = new Float32Array([
        1000, 0, 1000, repeticoes, repeticoes,
        1000, 0, 0.0, repeticoes, 0.0,
        -1000, 0, 0.0, 0.0, 0.0,
        -1000, 0, 1000, 0.0, repeticoes,
        1000, 0, 1000, repeticoes, repeticoes,
    ]);

    var cubo_meio = new Float32Array([
        // Face de trás
        65.0,  40.0, 0.0, 0.0, 1.0,
        40.0,  40.0, 0.0, 1.0, 1.0,
        40.0,  65.0, 0.0, 1.0, 0.0,
        65.0,  65.0, 0.0, 0.0, 0.0,
        65.0,  40.0, 0.0, 0.0, 1.0,

        // Face da esquerda
        40.0,  65.0, 0.0, 0.0, 0.0,
        40.0,  40.0, 0.0, 0.0, 1.0,
        40.0,  40.0, 25.0, 1.0, 1.0,
        40.0,  65.0, 25.0, 1.0, 0.0,
        40.0,  65.0, 0.0, 0.0, 0.0,

        // Face de baixo
        40.0,  40.0, 25.0, 0.0, 0.0,
        40.0,  40.0, 0.0, 0.0, 1.0,
        65.0,  40.0, 0.0, 1.0, 1.0,
        65.0,  40.0, 25.0, 1.0, 0.0,
        40.0,  40.0, 25.0, 0.0, 0.0,

        // Face de cima
        65.0,  65.0, 0.0, 1.0, 0.0,
        40.0,  65.0, 0.0, 0.0, 0.0,
        40.0,  65.0, 25.0, 0.0, 1.0,
        65.0,  65.0, 25.0, 1.0, 1.0,
        65.0,  65.0, 0.0, 1.0, 0.0,

        // Face da frente
        40.0,  65.0, 25.0, 0.0, 0.0,
        40.0,  40.0, 25.0, 0.0, 1.0,
        65.0,  40.0, 25.0, 1.0, 1.0,
        65.0,  65.0, 25.0, 1.0, 0.0,
        40.0,  65.0, 25.0, 0.0, 0.0,

        // Face da direita
        65.0,  40.0, 25.0, 0.0, 1.0,
        65.0,  40.0, 0.0, 1.0, 1.0,
        65.0,  65.0, 0.0, 1.0, 0.0,
        65.0,  65.0, 25.0, 0.0, 0.0,
        65.0,  40.0, 25.0, 0.0, 1.0,
    ]);

    var casa1 = new Float32Array([
        // Paredes
        10,  0, 20, 1.0, 1.0,
        10, 10, 20, 1.0, 0.0,
        10, 10, 10, 0.0, 0.0,
        10,  0, 10, 0.0, 1.0,
        10,  0, 20, 1.0, 1.0,

        20, 10, 20, 0.0, 0.0,
        20,  0, 20, 0.0, 1.0,
        20,  0, 10, 1.0, 1.0,
        20, 10, 10, 1.0, 0.0,
        20, 10, 20, 0.0, 0.0,

        20, 10, 10, 0.0, 0.0,
        20,  0, 10, 0.0, 1.0,
        10,  0, 10, 1.0, 1.0,
        10, 10, 10, 1.0, 0.0,
        20, 10, 10, 0.0, 0.0,

        20,  0, 20, 1.0, 1.0,
        20, 10, 20, 1.0, 0.0,
        10, 10, 20, 0.0, 0.0,
        10,  0, 20, 0.0, 1.0,
        20,  0, 20, 1.0, 1.0,

        // Teto esquerda
        10, 10, 20, 1.0, 1.0,
        15, 12, 20, 1.0, 0.0,
        15, 12, 10, 0.0, 0.0,
        10, 10, 10, 0.0, 1.0,
        10, 10, 20, 1.0, 1.0,
        // Teto direita
        15, 12, 20, 0.0, 0.0,
        20, 10, 20, 0.0, 1.0,
        20, 10, 10, 1.0, 1.0,
        15, 12, 10, 1.0, 0.0,
        15, 12, 20, 0.0, 0.0,
        // Teto frente
        20, 10, 20, 0.0, 0.0,
        15, 12, 20, 0.0, 1.0,
        15, 12, 20, 1.0, 1.0,
        10, 10, 20, 1.0, 0.0,
        20, 10, 20, 0.0, 0.0,
        // Teto trás
        10, 10, 10, 0.0, 0.0,
        15, 12, 10, 0.0, 1.0,
        15, 12, 10, 1.0, 1.0,
        20, 10, 10, 1.0, 0.0,
        10, 10, 10, 0.0, 0.0,
    ]);

    var casa2 = new Float32Array([
        // Paredes
        50,  0, 20, 1.0, 1.0,
        50, 10, 20, 1.0, 0.0,
        50, 10, 10, 0.0, 0.0,
        50,  0, 10, 0.0, 1.0,
        50,  0, 20, 1.0, 1.0,

        60, 10, 20, 0.0, 0.0,
        60,  0, 20, 0.0, 1.0,
        60,  0, 10, 1.0, 1.0,
        60, 10, 10, 1.0, 0.0,
        60, 10, 20, 0.0, 0.0,

        60, 10, 10, 0.0, 0.0,
        60,  0, 10, 0.0, 1.0,
        50,  0, 10, 1.0, 1.0,
        50, 10, 10, 1.0, 0.0,
        60, 10, 10, 0.0, 0.0,

        60,  0, 20, 1.0, 1.0,
        60, 10, 20, 1.0, 0.0,
        50, 10, 20, 0.0, 0.0,
        50,  0, 20, 0.0, 1.0,
        60,  0, 20, 1.0, 1.0,

        // Teto esquerda
        50, 10, 20, 1.0, 1.0,
        55, 12, 20, 1.0, 0.0,
        55, 12, 10, 0.0, 0.0,
        50, 10, 10, 0.0, 1.0,
        50, 10, 20, 1.0, 1.0,
        // Teto direita
        55, 12, 20, 0.0, 0.0,
        60, 10, 20, 0.0, 1.0,
        60, 10, 10, 1.0, 1.0,
        55, 12, 10, 1.0, 0.0,
        55, 12, 20, 0.0, 0.0,
        // Teto frente
        60, 10, 20, 0.0, 0.0,
        55, 12, 20, 0.0, 1.0,
        55, 12, 20, 1.0, 1.0,
        50, 10, 20, 1.0, 0.0,
        60, 10, 20, 0.0, 0.0,
        // Teto trás
        50, 10, 10, 0.0, 0.0,
        55, 12, 10, 0.0, 1.0,
        55, 12, 10, 1.0, 1.0,
        60, 10, 10, 1.0, 0.0,
        50, 10, 10, 0.0, 0.0,
    ]);

    var casa3 = new Float32Array([
        // Paredes
        90,  0, 20, 1.0, 1.0,
        90, 10, 20, 1.0, 0.0,
        90, 10, 10, 0.0, 0.0,
        90,  0, 10, 0.0, 1.0,
        90,  0, 20, 1.0, 1.0,

        100, 10, 20, 0.0, 0.0,
        100,  0, 20, 0.0, 1.0,
        100,  0, 10, 1.0, 1.0,
        100, 10, 10, 1.0, 0.0,
        100, 10, 20, 0.0, 0.0,

        100, 10, 10, 0.0, 0.0,
        100,  0, 10, 0.0, 1.0,
         90,  0, 10, 1.0, 1.0,
         90, 10, 10, 1.0, 0.0,
        100, 10, 10, 0.0, 0.0,

        100,  0, 20, 1.0, 1.0,
        100, 10, 20, 1.0, 0.0,
         90, 10, 20, 0.0, 0.0,
         90,  0, 20, 0.0, 1.0,
        100,  0, 20, 1.0, 1.0,

        // Teto esquerda
        90, 10, 20, 1.0, 1.0,
        95, 12, 20, 1.0, 0.0,
        95, 12, 10, 0.0, 0.0,
        90, 10, 10, 0.0, 1.0,
        90, 10, 20, 1.0, 1.0,
        // Teto direita
         95, 12, 20, 0.0, 0.0,
        100, 10, 20, 0.0, 1.0,
        100, 10, 10, 1.0, 1.0,
         95, 12, 10, 1.0, 0.0,
         95, 12, 20, 0.0, 0.0,
        // Teto frente
        100, 10, 20, 0.0, 0.0,
         95, 12, 20, 0.0, 1.0,
         95, 12, 20, 1.0, 1.0,
         90, 10, 20, 1.0, 0.0,
        100, 10, 20, 0.0, 0.0,
        // Teto trás
        90,  10, 10, 0.0, 0.0,
         95, 12, 10, 0.0, 1.0,
         95, 12, 10, 1.0, 1.0,
        100, 10, 10, 1.0, 0.0,
         90, 10, 10, 0.0, 0.0,
    ]);

    var cubo1 = new Float32Array([
        // Face de trás
        65.0,  40.0, 0.0, 0.0, 1.0,
        40.0,  40.0, 0.0, 1.0, 1.0,
        40.0,  65.0, 0.0, 1.0, 0.0,
        65.0,  65.0, 0.0, 0.0, 0.0,
        65.0,  40.0, 0.0, 0.0, 1.0,

        // Face da esquerda
        40.0,  65.0, 0.0, 0.0, 0.0,
        40.0,  40.0, 0.0, 0.0, 1.0,
        40.0,  40.0, 25.0, 1.0, 1.0,
        40.0,  65.0, 25.0, 1.0, 0.0,
        40.0,  65.0, 0.0, 0.0, 0.0,

        // Face de baixo
        40.0,  40.0, 25.0, 0.0, 0.0,
        40.0,  40.0, 0.0, 0.0, 1.0,
        65.0,  40.0, 0.0, 1.0, 1.0,
        65.0,  40.0, 25.0, 1.0, 0.0,
        40.0,  40.0, 25.0, 0.0, 0.0,

        // Face de cima
        65.0,  65.0, 0.0, 1.0, 0.0,
        40.0,  65.0, 0.0, 0.0, 0.0,
        40.0,  65.0, 25.0, 0.0, 1.0,
        65.0,  65.0, 25.0, 1.0, 1.0,
        65.0,  65.0, 0.0, 1.0, 0.0,

        // Face da frente
        40.0,  65.0, 25.0, 0.0, 0.0,
        40.0,  40.0, 25.0, 0.0, 1.0,
        65.0,  40.0, 25.0, 1.0, 1.0,
        65.0,  65.0, 25.0, 1.0, 0.0,
        40.0,  65.0, 25.0, 0.0, 0.0,

        // Face da direita
        65.0,  40.0, 25.0, 0.0, 1.0,
        65.0,  40.0, 0.0, 1.0, 1.0,
        65.0,  65.0, 0.0, 1.0, 0.0,
        65.0,  65.0, 25.0, 0.0, 0.0,
        65.0,  40.0, 25.0, 0.0, 1.0,
    ]);


    var cubo2 = new Float32Array([
        // Face de trás
        65.0,  40.0, 0.0, 0.0, 1.0,
        40.0,  40.0, 0.0, 1.0, 1.0,
        40.0,  65.0, 0.0, 1.0, 0.0,
        65.0,  65.0, 0.0, 0.0, 0.0,
        65.0,  40.0, 0.0, 0.0, 1.0,

        // Face da esquerda
        40.0,  65.0, 0.0, 0.0, 0.0,
        40.0,  40.0, 0.0, 0.0, 1.0,
        40.0,  40.0, 25.0, 1.0, 1.0,
        40.0,  65.0, 25.0, 1.0, 0.0,
        40.0,  65.0, 0.0, 0.0, 0.0,

        // Face de baixo
        40.0,  40.0, 25.0, 0.0, 0.0,
        40.0,  40.0, 0.0, 0.0, 1.0,
        65.0,  40.0, 0.0, 1.0, 1.0,
        65.0,  40.0, 25.0, 1.0, 0.0,
        40.0,  40.0, 25.0, 0.0, 0.0,

        // Face de cima
        65.0,  65.0, 0.0, 1.0, 0.0,
        40.0,  65.0, 0.0, 0.0, 0.0,
        40.0,  65.0, 25.0, 0.0, 1.0,
        65.0,  65.0, 25.0, 1.0, 1.0,
        65.0,  65.0, 0.0, 1.0, 0.0,

        // Face da frente
        40.0,  65.0, 25.0, 0.0, 0.0,
        40.0,  40.0, 25.0, 0.0, 1.0,
        65.0,  40.0, 25.0, 1.0, 1.0,
        65.0,  65.0, 25.0, 1.0, 0.0,
        40.0,  65.0, 25.0, 0.0, 0.0,

        // Face da direita
        65.0,  40.0, 25.0, 0.0, 1.0,
        65.0,  40.0, 0.0, 1.0, 1.0,
        65.0,  65.0, 0.0, 1.0, 0.0,
        65.0,  65.0, 25.0, 0.0, 0.0,
        65.0,  40.0, 25.0, 0.0, 1.0,
    ]);

    var scala = 0.35;
    cubo1 = scaleVertices(cubo1, scala, scala, scala);
    cubo1 = translateVertices(cubo1, -38, -20, 0);
    cubo1 = rotateVertices(cubo1, 0, angle, 0);

    cubo_meio = scaleVertices(cubo_meio, scala, scala, scala);
    cubo_meio = translateVertices(cubo_meio, 3, -20, 0);
    cubo_meio = rotateVertices(cubo_meio, 0, angle, 0);

    cubo2 = scaleVertices(cubo2, scala, scala, scala);
    cubo2 = translateVertices(cubo2, 43, -20, 0);
    cubo2 = rotateVertices(cubo2, 0, angle, 0);

    angle += 2.5;

    var coordenadas = new Float32Array([...piso, ...cubo_meio, ...casa1, ...casa2, ...casa3, ...cubo1, ...cubo2]);

    //Cria buffer na GPU e copia coordenadas para ele
    var bufPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPtr);
    gl.bufferData(gl.ARRAY_BUFFER, coordenadas, gl.STATIC_DRAW);

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

    // Calcula as normais dos vértices
    var normals = calculateNormals(coordenadas);

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

}
function configScene() {				  

    //submeter textura para gpu
    var tex0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[1]);

    var tex1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[1]);

    texGrama = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texGrama);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[9]);
    gl.generateMipmap(gl.TEXTURE_2D);

    var tex3 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, tex3);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

    var transforma = math.identity(4);
    transforma = math.flatten(math.transpose(transforma))._data;           
    transfPtr = gl.getUniformLocation(prog, "transf");
    gl.uniformMatrix4fv(transfPtr, false, transforma);
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

function checkCameraPosition(cameraPosition) {
    if (cameraPosition[0] >= 10 && cameraPosition[0] <= 20 &&
        cameraPosition[2] >= 10 && cameraPosition[2] <= 20) {
        switchShadersAndScript('newScript1.js', 'vertexShader1.glsl', 'fragmentShader1.glsl');
    } else if (cameraPosition[0] >= 50 && cameraPosition[0] <= 60 &&
               cameraPosition[2] >= 10 && cameraPosition[2] <= 20) {
        switchShadersAndScript('newScript2.js', 'vertexShader2.glsl', 'fragmentShader2.glsl');
    } else if (cameraPosition[0] >= 90 && cameraPosition[0] <= 100 &&
               cameraPosition[2] >= 10 && cameraPosition[2] <= 20) {
        switchShadersAndScript('newScript3.js', 'vertexShader3.glsl', 'fragmentShader3.glsl');
    }
}

results = ["loss.html", "loss.html", "loss.html"];
const randomValue = Math.floor(Math.random() * 3);
results[randomValue] = "congrats.html";

console.log(results);

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

    if (
        cameraPosition[0] >= 10 && cameraPosition[0] <= 20 &&
        cameraPosition[2] >= 10 && cameraPosition[2] <= 20
    ) {
        window.location.href = results[0];
    }
    if (
        cameraPosition[0] >= 50 && cameraPosition[0] <= 60 &&
        cameraPosition[2] >= 10 && cameraPosition[2] <= 20
    ) {
        window.location.href = results[1];
    }
    if (
        cameraPosition[0] >= 90 && cameraPosition[0] <= 100 &&
        cameraPosition[2] >= 10 && cameraPosition[2] <= 20
    ) {
        window.location.href = results[2];
    }

    updateViewMatrix();
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("mousemove", handleMouseMove);

function draw() {
    updateViewMatrix();

    createBuffer();   

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //desenha triângulos - executa shaders
    var texPtr = gl.getUniformLocation(prog, "tex");
    
    // Chão
    gl.uniform1i(texPtr, 2); 
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 2, 3);

    // Cubo do meio
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

    // Casa 1
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

    // Casa 2
    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 75, 3);
    gl.drawArrays(gl.TRIANGLES, 77, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 80, 3);
    gl.drawArrays(gl.TRIANGLES, 82, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 85, 3);
    gl.drawArrays(gl.TRIANGLES, 87, 3);

    gl.uniform1i(texPtr, 5);
    gl.drawArrays(gl.TRIANGLES, 90, 3);
    gl.drawArrays(gl.TRIANGLES, 92, 3);

    // Teto
    gl.uniform1i(texPtr, 4);
    gl.drawArrays(gl.TRIANGLES, 95, 3);
    gl.drawArrays(gl.TRIANGLES, 97, 3);

    gl.uniform1i(texPtr, 4);
    gl.drawArrays(gl.TRIANGLES, 100, 3);
    gl.drawArrays(gl.TRIANGLES, 102, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 105, 3);
    gl.drawArrays(gl.TRIANGLES, 107, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 110, 3);
    gl.drawArrays(gl.TRIANGLES, 112, 3);

    // Casa 3
    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 115, 3);
    gl.drawArrays(gl.TRIANGLES, 117, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 120, 3);
    gl.drawArrays(gl.TRIANGLES, 122, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 125, 3);
    gl.drawArrays(gl.TRIANGLES, 127, 3);

    gl.uniform1i(texPtr, 5);
    gl.drawArrays(gl.TRIANGLES, 130, 3);
    gl.drawArrays(gl.TRIANGLES, 132, 3);

    // Teto
    gl.uniform1i(texPtr, 4);
    gl.drawArrays(gl.TRIANGLES, 135, 3);
    gl.drawArrays(gl.TRIANGLES, 137, 3);

    gl.uniform1i(texPtr, 4);
    gl.drawArrays(gl.TRIANGLES, 140, 3);
    gl.drawArrays(gl.TRIANGLES, 142, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 145, 3);
    gl.drawArrays(gl.TRIANGLES, 147, 3);

    gl.uniform1i(texPtr, 1);
    gl.drawArrays(gl.TRIANGLES, 150, 3);
    gl.drawArrays(gl.TRIANGLES, 152, 3);

    // Cubo 1
    gl.uniform1i(texPtr, 3);
    gl.drawArrays(gl.TRIANGLES, 155, 3);
    gl.drawArrays(gl.TRIANGLES, 157, 3);

    gl.drawArrays(gl.TRIANGLES, 160, 3);
    gl.drawArrays(gl.TRIANGLES, 162, 3);

    gl.drawArrays(gl.TRIANGLES, 165, 3);
    gl.drawArrays(gl.TRIANGLES, 167, 3);

    gl.drawArrays(gl.TRIANGLES, 170, 3);
    gl.drawArrays(gl.TRIANGLES, 172, 3);

    gl.drawArrays(gl.TRIANGLES, 175, 3);
    gl.drawArrays(gl.TRIANGLES, 177, 3);

    gl.drawArrays(gl.TRIANGLES, 180, 3);
    gl.drawArrays(gl.TRIANGLES, 182, 3);

    // Cubo 2
    gl.drawArrays(gl.TRIANGLES, 185, 3);
    gl.drawArrays(gl.TRIANGLES, 187, 3);

    gl.drawArrays(gl.TRIANGLES, 190, 3);
    gl.drawArrays(gl.TRIANGLES, 192, 3);

    gl.drawArrays(gl.TRIANGLES, 195, 3);
    gl.drawArrays(gl.TRIANGLES, 197, 3);

    gl.drawArrays(gl.TRIANGLES, 200, 3);
    gl.drawArrays(gl.TRIANGLES, 202, 3);

    gl.drawArrays(gl.TRIANGLES, 205, 3);
    gl.drawArrays(gl.TRIANGLES, 207, 3);

    gl.drawArrays(gl.TRIANGLES, 210, 3);
    gl.drawArrays(gl.TRIANGLES, 212, 3);

    requestAnimationFrame(draw);
}
