var nmeta = nmeta || {};
nmeta.createRecid = function(cb) {
  $.ajax({
    type: 'POST',
    url: '/data/new/id.json',
    contentType: 'application/json',
    dataType: 'json',
    success: function(result) {
      cb(result);
    }
  });
};

$(function () {
    w2utils.settings.dataType = 'JSON';
    var showSettings = {
          header         : false,  // indicates if header is visible
          toolbar        : true,   // indicates if toolbar is visible
          footer         : true,   // indicates if footer is visible
          columnHeaders  : true,   // indicates if columns is visible
          lineNumbers    : true,   // indicates if line numbers column is visible
          expandColumn   : false,  // indicates if expand column is visible
          selectColumn   : false,  // indicates if select column is visible
          emptyRecords   : true,   // indicates if empty records are visible
          toolbarReload  : true,   // indicates if toolbar reload button is visible
          toolbarColumns : false,  // indicates if toolbar columns button is visible
          toolbarSearch  : false,  // indicates if toolbar search controls are visible
          toolbarAdd     : true,   // indicates if toolbar add new button is visible
          toolbarEdit    : false,  // indicates if toolbar edit button is visible
          toolbarDelete  : true,   // indicates if toolbar delete button is visible
          toolbarSave    : true,   // indicates if toolbar save button is visible
          selectionBorder: true,   // display border arround selection (for selectType = 'cell')
          recordTitles   : false,  // indicates if to define titles for records
          skipRecords    : false   // indicates if skip records should be visible
    };
    var addAction = function(event) {
      nmeta.createRecid(function(result) {
        w2ui[event.target].add(result);
      });
    };
    var columnsList = {
      users:  [
        { field: 'name', caption: '名前', size: '10%', editable: {type: 'text'} , sortable: true },
        { field: 'age', caption: '年齢', size: '10%', editable: {type: 'int'} , sortable: true },
      ],
    };
    var tables = ["users"];
    tables.forEach(function(table) {
      $('#' + table).w2grid({
          name: table,
          url: '/data/' + table + '.json',
          show: showSettings,
          onAdd: addAction,
          columns: columnsList[table],
      });
    });
});
