// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
require({cache:{"url:esri/views/2d/engine/webgl/shaders/lineShaders.xml":'\x3c?xml version\x3d"1.0" encoding\x3d"UTF-8"?\x3e\r\n\x3c!--\r\n  // YF TODO: (doc)\r\n--\x3e\r\n\x3csnippets\x3e\r\n  \x3csnippet name\x3d"thinLineParams"\x3e\r\n     \x3c![CDATA[\r\n    float thinLineHalfWidth \x3d 1.0; // meaning that a 2 pixels line width is considered a thin line\r\n    float thinLineWidthFactor \x3d 1.1;\r\n     ]]\x3e\r\n  \x3c/snippet\x3e\r\n\r\n  \x3csnippet name\x3d"lineVVUniformsVS"\x3e\r\n    \x3c![CDATA[\r\n  #if defined(VV_COLOR) || defined(VV_SIZE_MIN_MAX_VALUE) || defined(VV_SIZE_SCALE_STOPS) || defined(VV_SIZE_FIELD_STOPS) || defined(VV_SIZE_UNIT_VALUE) || defined(VV_OPACITY)\r\n    attribute vec3 a_vv;\r\n  #endif // VV_COLOR || VV_SIZE_MIN_MAX_VALUE || VV_SIZE_SCALE_STOPS || VV_SIZE_FIELD_STOPS || VV_SIZE_UNIT_VALUE || VV_OPACITY\r\n\r\n  #ifdef VV_COLOR\r\n    uniform float u_vvColorValues[8];\r\n    uniform vec4 u_vvColors[8];\r\n  #endif // VV_COLOR\r\n\r\n  #ifdef VV_SIZE_MIN_MAX_VALUE\r\n    uniform vec4 u_vvSizeMinMaxValue;\r\n  #endif // VV_SIZE_MIN_MAX_VALUE\r\n\r\n  #ifdef VV_SIZE_SCALE_STOPS\r\n    uniform float u_vvSizeScaleStopsValue;\r\n  #endif\r\n\r\n  #ifdef VV_SIZE_FIELD_STOPS\r\n    uniform float u_vvSizeFieldStopsValues[6];\r\n    uniform float u_vvSizeFieldStopsSizes[6];\r\n  #endif // VV_SIZE_FIELD_STOPS\r\n\r\n  #ifdef VV_SIZE_UNIT_VALUE\r\n    uniform float u_vvSizeUnitValueWorldToPixelsRatio;\r\n  #endif // VV_SIZE_UNIT_VALUE\r\n\r\n  #ifdef VV_OPACITY\r\n    uniform float u_vvOpacityValues[8];\r\n    uniform float u_vvOpacities[8];\r\n  #endif // VV_OPACITY\r\n    ]]\x3e\r\n  \x3c/snippet\x3e\r\n\r\n  \x3csnippet name\x3d"lineVVFunctions"\x3e\r\n    \x3c![CDATA[\r\n    bool isNan(float val) {\r\n      return !( val \x3c 0.0 || 0.0 \x3c val || val \x3d\x3d 0.0 );\r\n    }\r\n    \r\n  #ifdef VV_SIZE_MIN_MAX_VALUE\r\n    float getVVMinMaxSize(float sizeValue, float fallback) {\r\n      if (isNan(sizeValue)) { \r\n        return fallback;\r\n      }\r\n\r\n      float f \x3d (sizeValue - u_vvSizeMinMaxValue.x) / (u_vvSizeMinMaxValue.y - u_vvSizeMinMaxValue.x);\r\n      return clamp(mix(u_vvSizeMinMaxValue.z, u_vvSizeMinMaxValue.w, f), u_vvSizeMinMaxValue.z, u_vvSizeMinMaxValue.w);\r\n    }\r\n  #endif // VV_SIZE_MIN_MAX_VALUE\r\n\r\n  #ifdef VV_SIZE_FIELD_STOPS\r\n    const int VV_SIZE_N \x3d 6;\r\n    float getVVStopsSize(float sizeValue, float fallback) {\r\n      if (isNan(sizeValue)) { \r\n        return fallback;\r\n      }\r\n\r\n      if (sizeValue \x3c\x3d u_vvSizeFieldStopsValues[0]) {\r\n        return u_vvSizeFieldStopsSizes[0];\r\n      }\r\n\r\n      for (int i \x3d 1; i \x3c VV_SIZE_N; ++i) {\r\n        if (u_vvSizeFieldStopsValues[i] \x3e\x3d sizeValue) {\r\n          float f \x3d (sizeValue - u_vvSizeFieldStopsValues[i-1]) / (u_vvSizeFieldStopsValues[i] - u_vvSizeFieldStopsValues[i-1]);\r\n          return mix(u_vvSizeFieldStopsSizes[i-1], u_vvSizeFieldStopsSizes[i], f);\r\n        }\r\n      }\r\n\r\n      return u_vvSizeFieldStopsSizes[VV_SIZE_N - 1];\r\n    }\r\n  #endif // VV_SIZE_FIELD_STOPS\r\n\r\n  #ifdef VV_SIZE_UNIT_VALUE\r\n    float getVVUnitValue(float sizeValue, float fallback) {\r\n      if (isNan(sizeValue)) { \r\n        return fallback;\r\n      }\r\n\r\n      return u_vvSizeUnitValueWorldToPixelsRatio * sizeValue;\r\n    }\r\n  #endif // VV_SIZE_UNIT_VALUE\r\n\r\n  #ifdef VV_OPACITY\r\n    const int VV_OPACITY_N \x3d 8;\r\n    float getVVOpacity(float opacityValue) {\r\n      if (isNan(opacityValue)) { \r\n        return 1.0;\r\n      }\r\n\r\n      if (opacityValue \x3c\x3d u_vvOpacityValues[0]) {\r\n        return u_vvOpacities[0];\r\n      }\r\n\r\n      for (int i \x3d 1; i \x3c VV_OPACITY_N; ++i) {\r\n        if (u_vvOpacityValues[i] \x3e\x3d opacityValue) {\r\n          float f \x3d (opacityValue - u_vvOpacityValues[i-1]) / (u_vvOpacityValues[i] - u_vvOpacityValues[i-1]);\r\n          return mix(u_vvOpacities[i-1], u_vvOpacities[i], f);\r\n        }\r\n      }\r\n\r\n      return u_vvOpacities[VV_OPACITY_N - 1];\r\n    }\r\n  #endif // VV_OPACITY\r\n\r\n  #ifdef VV_COLOR\r\n    const int VV_COLOR_N \x3d 8;\r\n\r\n    vec4 getVVColor(float colorValue, vec4 fallback) {\r\n      if (isNan(colorValue)) { \r\n        return fallback;\r\n      }\r\n\r\n      if (colorValue \x3c\x3d u_vvColorValues[0]) {\r\n        return u_vvColors[0];\r\n      }\r\n\r\n      for (int i \x3d 1; i \x3c VV_COLOR_N; ++i) {\r\n        if (u_vvColorValues[i] \x3e\x3d colorValue) {\r\n          float f \x3d (colorValue - u_vvColorValues[i-1]) / (u_vvColorValues[i] - u_vvColorValues[i-1]);\r\n          return mix(u_vvColors[i-1], u_vvColors[i], f);\r\n        }\r\n      }\r\n\r\n      return u_vvColors[VV_COLOR_N - 1];\r\n    }\r\n  #endif // VV_COLOR\r\n    ]]\x3e\r\n  \x3c/snippet\x3e\r\n\r\n  \x3csnippet name\x3d"lineVS"\x3e\r\n    \x3c![CDATA[\r\n     precision mediump float;\r\n\r\n     attribute vec2 a_pos;\r\n     attribute vec4 a_id;\r\n     attribute vec4 a_color;\r\n     attribute vec4 a_offsetAndNormal;\r\n     attribute vec2 a_accumulatedDistanceAndHalfWidth;\r\n     attribute vec4 a_tlbr;\r\n     attribute vec4 a_segmentDirection;\r\n\r\n     // the relative transformation of a vertex given in tile coordinates to a relative normalized coordinate\r\n     // relative to the tile\'s upper left corner\r\n     // the extrusion vector.\r\n     uniform highp mat4 u_transformMatrix;\r\n     // the extrude matrix which is responsible for the \'anti-zoom\' as well as the rotation\r\n     uniform highp mat4 u_extrudeMatrix;\r\n     // u_normalized_origin is the tile\'s upper left corner given in normalized coordinates\r\n     uniform highp vec2 u_normalized_origin;\r\n     uniform lowp float u_opacity; // the layer\'s opacity\r\n     uniform mediump float u_zoomFactor;\r\n     uniform mediump float u_antialiasing;\r\n\r\n     // the interpolated normal to the line. the information is packed into the two LSBs of the vertex coordinate\r\n     varying mediump vec2 v_normal;\r\n     varying mediump float v_lineHalfWidth;\r\n     varying lowp vec4 v_color;\r\n     varying lowp float v_transparency;\r\n\r\n     const float scale \x3d 1.0 / 31.0;\r\n#ifdef SDF\r\n     const float widthFactor \x3d 2.0;\r\n#else\r\n     const float widthFactor \x3d 1.0;\r\n#endif\r\n\r\n\r\n#ifdef PATTERN\r\n     uniform mediump vec2 u_mosaicSize;\r\n\r\n     varying mediump vec4 v_tlbr; // normalized pattern coordinates [0, 1]\r\n     varying mediump vec2 v_patternSize;\r\n#endif // PATTERN\r\n\r\n// we need to accumulated distance only if it is a pattern or an SDF line\r\n#if defined(PATTERN) || defined(SDF)\r\n     varying highp float v_accumulatedDistance;\r\n#endif // PATTERN SDF\r\n\r\n#ifdef ID\r\n     varying highp vec4 v_id;\r\n#endif // ID\r\n\r\n     // import the VV inputs and functions (they are #ifdefed, so if the proper #define is not set it will end-up being a no-op)\r\n     $lineVVUniformsVS\r\n     $lineVVFunctions\r\n\r\n     void main()\r\n     {\r\n     // size VV block\r\n#if defined(VV_SIZE_MIN_MAX_VALUE) || defined(VV_SIZE_SCALE_STOPS) || defined(VV_SIZE_FIELD_STOPS) || defined(VV_SIZE_UNIT_VALUE)\r\n\r\n#ifdef VV_SIZE_MIN_MAX_VALUE\r\n       mediump float lineHalfWidth \x3d 0.5 * getVVMinMaxSize(a_vv.x, 2.0 * a_accumulatedDistanceAndHalfWidth.y * scale);\r\n#endif // VV_SIZE_MIN_MAX_VALUE\r\n\r\n#ifdef VV_SIZE_SCALE_STOPS\r\n       mediump float lineHalfWidth \x3d 0.5 * u_vvSizeScaleStopsValue;\r\n#endif // VV_SIZE_SCALE_STOPS\r\n\r\n#ifdef VV_SIZE_FIELD_STOPS\r\n       mediump float lineHalfWidth \x3d 0.5 * getVVStopsSize(a_vv.x, 2.0 * a_accumulatedDistanceAndHalfWidth.y * scale);\r\n#endif // VV_SIZE_FIELD_STOPS\r\n\r\n#ifdef VV_SIZE_UNIT_VALUE\r\n       mediump float lineHalfWidth \x3d 0.5 * getVVUnitValue(a_vv.x, 2.0 * a_accumulatedDistanceAndHalfWidth.y * scale);\r\n#endif // VV_SIZE_UNIT_VALUE\r\n\r\n#else // no VV\r\n       mediump float lineHalfWidth \x3d a_accumulatedDistanceAndHalfWidth.y * scale;\r\n#endif // defined(VV_SIZE_MIN_MAX_VALUE) || defined(VV_SIZE_SCALE_STOPS) || defined(VV_SIZE_FIELD_STOPS) || defined(VV_SIZE_UNIT_VALUE)\r\n\r\n#ifdef VV_OPACITY\r\n      v_transparency \x3d u_opacity * getVVOpacity(a_vv.z);\r\n#else\r\n      v_transparency \x3d u_opacity;\r\n#endif // VV_OPACITY\r\n\r\n#ifdef VV_COLOR\r\n      v_color \x3d getVVColor(a_vv.y, a_color);\r\n#else\r\n      v_color \x3d a_color;\r\n#endif // VV_COLOR\r\n\r\n       // make sure to clip the vertices in case that the width of the line is 0 (or negative)\r\n       float z \x3d 2.0 * step(lineHalfWidth, 0.0);\r\n\r\n       // add an antialiasing distance. We use 0.2 rather than 0.5 in order to match the SVG renderer\r\n       // also limit the total line width to 1.3 pixels. Below this value lines don\'t look good compared to the SVG renderer\r\n       lineHalfWidth \x3d max(lineHalfWidth, 0.45) + 0.2 * u_antialiasing;\r\n\r\n       // include the thin line parameters (thinLineHalfWidth and thinLineWidthFactor)\r\n       $thinLineParams\r\n       // for now assume that a thin line is a line which is under 2 pixels (1 pixels on either sides of the centerline)\r\n       // in practice, a thin line is a line who\'s half width vary from 0.45px to the value of thinLineHalfWidth, as the value\r\n       // is claped in line 221 above\r\n       mediump float thinLineFactor \x3d max(thinLineWidthFactor * step(lineHalfWidth, thinLineHalfWidth), 1.0);\r\n\r\n       v_lineHalfWidth \x3d lineHalfWidth;\r\n\r\n       // calculate the relative distance from the centerline to the edge of the line. Since offset is given in integers (for the\r\n       // sake of using less attribute memory, we need to scale it back to the original range of ~ [0, 1])\r\n       // in a case of a thin line we move each vertex twice as far\r\n       mediump vec2 dist \x3d thinLineFactor * widthFactor * lineHalfWidth * a_offsetAndNormal.xy * scale;\r\n\r\n       // transform the vertex\r\n       gl_Position \x3d vec4(u_normalized_origin, 0.0, 0.0) + u_transformMatrix * vec4(a_pos, z, 1.0) + u_extrudeMatrix * vec4(dist, 0.0, 0.0);\r\n       v_normal \x3d a_offsetAndNormal.zw * scale;\r\n\r\n#if defined(PATTERN) || defined(SDF)\r\n       v_accumulatedDistance \x3d a_accumulatedDistanceAndHalfWidth.x + dot(scale * a_segmentDirection.xy, dist / u_zoomFactor);\r\n#endif // PATTERN || SDF\r\n\r\n#ifdef PATTERN\r\n      v_tlbr \x3d vec4(a_tlbr.x / u_mosaicSize.x, a_tlbr.y / u_mosaicSize.y, a_tlbr.z / u_mosaicSize.x, a_tlbr.w / u_mosaicSize.y);\r\n      v_patternSize \x3d vec2(a_tlbr.z - a_tlbr.x, a_tlbr.w - a_tlbr.y);\r\n#endif // PATTERN\r\n\r\n#ifdef ID\r\n      v_id \x3d a_id;\r\n#endif // ID\r\n     }\r\n    ]]\x3e\r\n  \x3c/snippet\x3e\r\n\r\n  \x3csnippet name\x3d"lineFS"\x3e\r\n    \x3c![CDATA[\r\n       precision lowp float;\r\n\r\n       uniform lowp float u_blur;\r\n       uniform mediump float u_antialiasing;\r\n\r\n       varying mediump vec2 v_normal;\r\n       varying mediump float v_lineHalfWidth;\r\n       varying lowp vec4 v_color;\r\n       varying lowp float v_transparency;\r\n\r\n#if defined(PATTERN) || defined(SDF)\r\n      uniform sampler2D u_texture;\r\n      uniform mediump float u_zoomFactor;\r\n\r\n      varying mediump vec4 v_tlbr; // normalized pattern coordinates [0, 1]\r\n      varying mediump vec2 v_patternSize;\r\n      varying highp float v_accumulatedDistance;\r\n#endif // PATTERN SDF\r\n\r\n#ifdef SDF\r\n      const float sdfPatternHalfWidth \x3d 15.5; // YF: assumed that the width will be set to 31\r\n     const float widthFactor \x3d 2.0;\r\n\r\n    // Factors to convert rgba back to float\r\n    const vec4 rgba2float_factors \x3d vec4(\r\n        255.0 / (256.0),\r\n        255.0 / (256.0 * 256.0),\r\n        255.0 / (256.0 * 256.0 * 256.0),\r\n        255.0 / (256.0 * 256.0 * 256.0 * 256.0)\r\n      );\r\n\r\n    float rgba2float(vec4 rgba) {\r\n      // Convert components from 0-\x3e1 back to 0-\x3e255 and then\r\n      // add the components together with their corresponding\r\n      // fixed point factors, i.e. (256^1, 256^2, 256^3, 256^4)\r\n      return dot(rgba, rgba2float_factors);\r\n    }\r\n#endif // SDF\r\n\r\n#ifdef ID\r\n     varying highp vec4 v_id;\r\n#endif // ID\r\n\r\n       void main()\r\n       {\r\n         // include the thin line parameters (thinLineHalfWidth and thinLineWidthFactor)\r\n         $thinLineParams\r\n\r\n         // for now assume that a thin line is a line which is under 2 pixels (1 pixels on either sides of the centerline)\r\n         mediump float thinLineFactor \x3d max(thinLineWidthFactor * step(v_lineHalfWidth, thinLineHalfWidth), 1.0);\r\n\r\n         // dist represent the distance of the fragment from the line. 1.0 or -1.0 will be the values on the edge of the line,\r\n         // and any value in between will be inside the line (the sign represent the direction - right or left).\r\n         // since u_linewidth.s (half line width) is represented in pixels, dist is also given in pixels\r\n         mediump float fragDist \x3d length(v_normal) * v_lineHalfWidth;\r\n\r\n         // calculate the alpha given the difference between the line-width and the distance of the fragment from the center-line.\r\n         // when it is a thin line then use a slightly shallower slope in order to add more feathering\r\n         lowp float alpha \x3d clamp(thinLineFactor * (v_lineHalfWidth - fragDist) / (u_blur + thinLineFactor - 1.0), 0.0, 1.0);\r\n\r\n#if defined(SDF)\r\n         mediump float lineHalfWidth \x3d widthFactor * v_lineHalfWidth;\r\n         mediump float lineWidthRatio \x3d lineHalfWidth / sdfPatternHalfWidth;\r\n         mediump float relativeTexX \x3d mod((u_zoomFactor * v_accumulatedDistance + v_normal.x * lineHalfWidth) / (lineWidthRatio * v_patternSize.x), 1.0);\r\n         mediump float relativeTexY \x3d 0.5 + 0.5 * v_normal.y;\r\n\r\n          // claculate the actual texture coordinates by interpolating between the TL/BR pattern coordinates\r\n         mediump vec2 texCoord \x3d mix(v_tlbr.xy, v_tlbr.zw, vec2(relativeTexX, relativeTexY));\r\n\r\n         // calculate the distance from the edge [-0.5, 0.5]\r\n         mediump float d \x3d rgba2float(texture2D(u_texture, texCoord)) - 0.5;\r\n\r\n         // the distance is a proportional to the line width\r\n         float dist \x3d d * lineHalfWidth;\r\n\r\n         lowp vec4 fillPixelColor \x3d v_transparency * alpha * clamp(0.5 - dist, 0.0, 1.0) * v_color;\r\n        gl_FragColor \x3d fillPixelColor;\r\n#elif defined(PATTERN)\r\n         // we need to calculate the relative portion of the line texture along the line given the accumulated distance along the line\r\n         // The computed value should is anumber btween 0 and 1 which will later be used to interpolate btween the BR and TL values\r\n         mediump float relativeTexX \x3d mod((u_zoomFactor * v_accumulatedDistance + v_normal.x * v_lineHalfWidth) / v_patternSize.x, 1.0);\r\n\r\n         // in order to calculate the texture coordinates prependicular to the line (Y axis), we use the interpolated normal values\r\n         // which range from -1.0 to 1.0. On the line\'s centerline, the value of the interpolated normal is 0.0, however the relative\r\n         // texture value shpould be 0.5 (given that at the bottom of the line, the texture coordinate must be equal to 0.0)\r\n         // (TL) ---------------------------      --\x3e left edge of line. Interpolatedf normal is 1.0\r\n         //              | -\x3e line-width / 2\r\n         //      - - - - - - - - - - - - - -\r\n         //              | -\x3e line-width / 2\r\n         //      ---------------------------- (BR)--\x3e right edge of line. Interpolatedf normal is -1.0\r\n\r\n         mediump float relativeTexY \x3d 0.5 + (v_normal.y * v_lineHalfWidth / v_patternSize.y);\r\n\r\n         // claculate the actual texture coordinates by interpolating between the TL/BR pattern coordinates\r\n         mediump vec2 texCoord \x3d mix(v_tlbr.xy, v_tlbr.zw, vec2(relativeTexX, relativeTexY));\r\n\r\n         // get the color from the texture\r\n         lowp vec4 color \x3d texture2D(u_texture, texCoord);\r\n\r\n         gl_FragColor \x3d v_transparency * alpha * v_color * color;\r\n#else // solid line (no texture, no pattern)\r\n         // output the fragment color\r\n         gl_FragColor \x3d v_transparency * alpha * v_color;\r\n#endif // SDF\r\n\r\n#ifdef HIGHLIGHT\r\n         gl_FragColor.a \x3d step(1.0 / 255.0, gl_FragColor.a);\r\n#endif // HIGHLIGHT\r\n\r\n #ifdef ID\r\n         if (gl_FragColor.a \x3c 1.0 / 255.0) {\r\n           discard;\r\n         }\r\n         gl_FragColor \x3d v_id;\r\n #endif // ID\r\n       }\r\n    ]]\x3e\r\n  \x3c/snippet\x3e\r\n\r\n\x3c/snippets\x3e\r\n'}});
define(["require","exports","dojo/text!./lineShaders.xml","../../../../webgl/ShaderSnippets"],function(a,d,c,b){a=new b;b.parse(c,a);return a});