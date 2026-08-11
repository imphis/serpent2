(function () {
  var canvas = document.getElementById('rainfield');
  var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return;

  var scale = 0.5;
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);

  window.addEventListener('resize', function () {
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
  });

  var vsrc = `
attribute vec2 apos;
void main() { gl_Position = vec4(apos, 0.0, 1.0); }
`;

  var fsrc = `
precision mediump float;
uniform vec2 ures;
uniform float utime;

#define S(a,b,t) smoothstep(a,b,t)

vec3 N13(float p) {
  vec3 p3 = fract(vec3(p)*vec3(.1031,.11369,.13787));
  p3 += dot(p3,p3.yzx+19.19);
  return fract(vec3((p3.x+p3.y)*p3.z,(p3.x+p3.z)*p3.y,(p3.y+p3.z)*p3.x));
}

float N(float t) {
  return fract(sin(t*12345.564)*7658.76);
}

float saw(float b, float t) {
  return S(0.,b,t)*S(1.,b,t);
}

vec2 droplayer(vec2 uv, float t) {
  vec2 UV = uv;
  uv.y += t*0.75;
  vec2 a = vec2(6.,1.);
  vec2 grid = a*2.;
  vec2 id = floor(uv*grid);
  float colshift = N(id.x);
  uv.y += colshift;
  id = floor(uv*grid);
  vec3 n = N13(id.x*35.2+id.y*2376.1);
  vec2 st = fract(uv*grid)-vec2(.5,0.);
  float x = n.x-.5;
  float y = UV.y*20.;
  float wiggle = sin(y+sin(y));
  x += wiggle*(.5-abs(x))*(n.z-.5);
  x *= .7;
  float ti = fract(t+n.z);
  y = (saw(.85,ti)-.5)*.9+.5;
  vec2 p = vec2(x,y);
  float d = length((st-p)*a.yx);
  float maindrop = S(.4,.0,d);
  float r = sqrt(S(1.,y,st.y));
  float cd = abs(st.x-x);
  float trail = S(.23*r,.15*r*r,cd);
  float trailfront = S(-.02,.02,st.y-y);
  trail *= trailfront*r*r;
  y = UV.y;
  float trail2 = S(.2*r,.0,cd);
  float droplets = max(0.,(sin(y*(1.-y)*120.)-st.y))*trail2*trailfront*n.z;
  y = fract(y*10.)+(st.y-.5);
  float dd = length(st-vec2(x,y));
  droplets = S(.3,0.,dd);
  float m = maindrop+droplets*r*trailfront;
  return vec2(m,trail);
}

float staticdrops(vec2 uv, float t) {
  uv *= 40.;
  vec2 id = floor(uv);
  uv = fract(uv)-.5;
  vec3 n = N13(id.x*107.45+id.y*3543.654);
  vec2 p = (n.xy-.5)*.7;
  float d = length(uv-p);
  float fade = saw(.025,fract(t+n.z));
  return S(.3,0.,d)*fract(n.z*10.)*fade;
}

vec2 drops(vec2 uv, float t, float l0, float l1, float l2) {
  float s = staticdrops(uv,t)*l0;
  vec2 m1 = droplayer(uv,t)*l1;
  vec2 m2 = droplayer(uv*1.85,t)*l2;
  float c = s+m1.x+m2.x;
  c = S(.3,1.,c);
  return vec2(c,max(m1.y*l0,m2.y*l1));
}

float hash2(vec2 p) {
  p = fract(p*vec2(443.897,397.297));
  p += dot(p,p.yx+19.27);
  return fract(p.x*p.y);
}

float hash3v(vec3 p) {
  p = fract(p*vec3(443.897,397.297,491.187));
  p += dot(p.zxy,p.yxz+19.27);
  return fract(p.x*p.y*p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(
    mix(mix(hash3v(i),hash3v(i+vec3(1,0,0)),f.x),
        mix(hash3v(i+vec3(0,1,0)),hash3v(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash3v(i+vec3(0,0,1)),hash3v(i+vec3(1,0,1)),f.x),
        mix(hash3v(i+vec3(0,1,1)),hash3v(i+vec3(1,1,1)),f.x),f.y),f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++) {
    v += a*noise3(p);
    p = p*2.03+vec3(31.41,17.29,43.71);
    a *= 0.49;
  }
  return v;
}

vec3 skycol(vec2 uv, float t) {
  vec3 skytop = vec3(0.04,0.05,0.12);
  vec3 skybot = vec3(0.08,0.10,0.20);
  float skygrad = uv.y*0.5+0.5;
  vec3 col = mix(skybot,skytop,skygrad);

  for(int i=0;i<30;i++) {
    float fi = float(i);
    float sx = hash2(vec2(fi,10.0))*2.0-1.0;
    float sy = hash2(vec2(fi,11.0))*0.8+0.1;
    float brightness = hash2(vec2(fi,12.0));
    float twinkle = sin(t*(1.0+brightness*2.0)+fi*7.0)*0.3+0.7;
    col += vec3(0.8,0.85,1.0)*twinkle*brightness*0.4*smoothstep(0.01,0.0,length(uv-vec2(sx,sy)));
  }

  for(int i=0;i<8;i++) {
    float fi = float(i);
    float cx = hash2(vec2(fi,0.0))*3.0-1.5;
    float cy = 0.15+hash2(vec2(fi,1.0))*0.45;
    float speed = 0.015+hash2(vec2(fi,2.0))*0.02;
    float wrapped = mod(cx+t*speed+2.0,4.0)-2.0;
    vec2 d = uv-vec2(wrapped,cy);
    float dist = length(d);
    float lp = 6.28318/120.0;
    float lt = sin(t*lp)*cos(t*lp*0.4)*3.0+cos(t*lp*0.7)*2.0;
    float lt2 = sin(t*lp*0.5)*1.5+cos(t*lp*0.3)*1.0;
    float radius = 0.25+0.08*sin(lt*0.3+cx*5.0);
    if(dist>radius*1.8) continue;
    float edge = 1.0-smoothstep(radius*0.6,radius*1.8,dist);
    vec3 q = vec3(uv*3.0,lt);
    float n = fbm(q);
    float detail = fbm(q*2.5+vec3(0.0,0.0,lt2));
    float shape = n*0.6+detail*0.4;
    shape = smoothstep(0.35,0.7,shape);
    float puff = 0.0;
    for(int j=0;j<4;j++) {
      float fj = float(j);
      float ang = fj*1.57+cx*3.0;
      float r = radius*(0.3+fj*0.15);
      vec2 offs = vec2(cos(ang),sin(ang)*0.3)*r;
      float pd = length(d-offs);
      puff += exp(-pd*pd*30.0)*0.4;
    }
    float body = shape*edge+puff*edge;
    float bright = 1.0-smoothstep(-0.05,radius*0.5,d.y)*0.3;
    float cc = clamp(body*bright,0.0,1.0);
    vec3 cbot = vec3(0.10,0.12,0.22);
    vec3 ctop = vec3(0.18,0.20,0.35);
    float ht = (uv.y-cy+0.15)*3.0;
    vec3 cloudcol = mix(cbot,ctop,clamp(ht,0.0,1.0));
    col = mix(col,cloudcol,cc*0.85);
  }

  return col;
}

void main() {
  vec2 fragcoord = gl_FragCoord.xy;
  vec2 uv = (fragcoord-.5*ures)/ures.y;
  vec2 UV = fragcoord/ures;
  float T = utime;
  float t = T*.2;

  float rainamt = .75;

  vec2 e = vec2(.001,0.);
  float l0 = S(-.5,1.,rainamt)*2.;
  float l1 = S(.25,.75,rainamt);
  float l2 = S(.0,.5,rainamt);

  vec2 c = drops(uv,t,l0,l1,l2);
  float cx = drops(uv+e,t,l0,l1,l2).x;
  float cy = drops(uv+e.yx,t,l0,l1,l2).x;
  vec2 n = vec2(cx-c.x,cy-c.x);

  vec3 col = skycol(UV+n,T);

  float fog = c.x*.08;
  col = mix(col,vec3(.08,.10,.18),fog);

  col *= 1.-dot(UV-.5,UV-.5);
  col = pow(max(col,vec3(0.)),vec3(.96));

  gl_FragColor = vec4(col,1.);
}
`;

  function makeshader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, makeshader(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(prog, makeshader(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  var apos = gl.getAttribLocation(prog, 'apos');
  gl.enableVertexAttribArray(apos);
  gl.vertexAttribPointer(apos, 2, gl.FLOAT, false, 0, 0);

  var ures = gl.getUniformLocation(prog, 'ures');
  var utime = gl.getUniformLocation(prog, 'utime');
  var start = performance.now();

  function frame() {
    var t = (performance.now() - start) / 1000;
    gl.uniform2f(ures, canvas.width, canvas.height);
    gl.uniform1f(utime, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }

  window.livelyPropertyListener = function (name, val) {};
  window.livelyAudioListener = function (data) {};

  gl.viewport(0, 0, canvas.width, canvas.height);
  frame();
})();
