module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-import'),
    require('postcss-nested'),
    require('postcss-custom-properties'),
    require('postcss-calc'),
    require('postcss-color-function'),
    ...(process.env.NODE_ENV === 'production' 
      ? [
          require('cssnano')({
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              convertValues: true,
              discardDuplicates: true,
              discardEmpty: true,
              mergeIdents: false,
              reduceIdents: false,
              mergeRules: true,
              mergeLonghand: true,
              discardUnused: false // Keep this false to avoid removing dynamic classes
            }]
          })
        ] 
      : []
    )
  ]
};