module.exports = {
  main: {
    files: [
      {expand: true, cwd: 'client/', src: ['fonts/**'], dest: 'build/'},
      {expand: true, cwd: 'client/', src: ['icons/**'], dest: 'build/'},
      {expand: true, cwd: 'client/', src: ['templates/**'], dest: 'build/'},
      {expand: true, cwd: 'client/', src: ['robots.txt'], dest: 'build/'}
    ]
  }
};
