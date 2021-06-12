// Workaround to use logical assignment
// until https://github.com/facebook/create-react-app/pull/10832 is merged
// see https://github.com/facebook/create-react-app/issues/9908

module.exports = {
   babel: {
      parserOpts: {
         strictMode: true,
      },
      plugins: [
         'const-enum',
         '@babel/plugin-proposal-logical-assignment-operators'
      ]
   }
};

