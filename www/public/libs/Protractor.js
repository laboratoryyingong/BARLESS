describe('angularjs homepage', function() {
  it('should pass E2E test', function() {

    // Load the AngularJS homepage.
    browser.get('/Users/MaxYinGonG/Desktop/SASS-Angular_Example/view/index.html');

    var items = element.all(by.css('.items li')).map(function(elm, index) {
      return {
        index: index,
        text: elm.getText(),
        class: elm.getAttribute('class')
      };
    });

    expect(items).toEqual([
      {index: 0, text: 'First', class: 'one'},
      {index: 1, text: 'Second', class: 'two'},
      {index: 2, text: 'Third', class: 'three'}
    ]);

  });
});


