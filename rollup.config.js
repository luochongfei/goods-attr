import { terser } from 'rollup-plugin-terser';

const fileName = 'goods-attr';
const moduleName = 'GoodsAttr';

export default {
    input: './src/index.js',
    output: [
        {
            file: `./dist/${fileName}.esm.js`,
            format: 'esm',
        },
        {
            file: `./dist/${fileName}.esm.min.js`,
            format: 'esm',
            plugins: [
                terser()
            ]
        },
        {
            name: moduleName,
            file: `./dist/${fileName}.umd.js`,
            format: 'umd',
        },
        {
            name: moduleName,
            file: `./dist/${fileName}.umd.min.js`,
            format: 'umd',
            plugins: [
                terser(),
            ]
        },
    ],
};