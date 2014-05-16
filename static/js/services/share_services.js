(function() {
  'use strict';
  
  var module = angular.module(
    'communityshare.services.share',
    [
      'communityshare.services.item'
    ])

  module.factory(
    'Share',
    function(ItemFactory, EvntBase, SessionBase) {
      var Share = ItemFactory('share');
      Share.prototype.updateFromData = function(shareData) {
        this._baseUpdateFromData(shareData);
        if (this.events) {
          for (var i=0; i<this.events.length; i++) {
            this.events[i] = EvntBase.make(this.events[i]);
          }
        } else {
          this.events = [];
        }
        if (this.educator && this.community_partner) {
          if (SessionBase.activeUser.id === this.educator.id) {
            this.otherUser = this.community_partner;
          } else if (SessionBase.activeUser.id === this.community_partner.id) {
            this.otherUser = this.educator;
          }
        }
      };
      Share.prototype.addNewEvent = function() {
        var evnt = new EvntBase({
          share_id: this.id,
          title: this.title,
          description: '',
          datetime_start: undefined,
          datetime_stop: undefined
        });
        this.events.push(evnt);
      };
      return Share;
    });

  module.factory(
    'EvntBase',
    function(ItemFactory) {
      var Evnt = ItemFactory('event');
      return Evnt;
    });

  var splitDateTime = function(datetime) {
    var date = new Date(datetime.getFullYear(),
                        datetime.getMonth(),
                        datetime.getDate());
    var time = new Date(1900, 0, 1,
                        datetime.getHours(),
                        datetime.getMinutes());
    var combined = {
      date: date,
      time: time
    };
    return combined;
  };

  var combineDateTime = function(date, time) {
    var offset = time.getTimezoneOffset();
    var combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes());
    return combined;
  };

  module.factory(
    'Evnt',
    function(ItemFactory, EvntBase, Share) {
      EvntBase.prototype.updateFromData = function(eventData) {
        this._baseUpdateFromData(eventData);
        if (this.datetime_start) {
          this.datetime_start = new Date(this.datetime_start);
          var split = splitDateTime(this.datetime_start);
          this.date = split.date;
          this.time_start = split.time;
        }
        if (this.datetime_stop) {
          this.datetime_stop = new Date(this.datetime_stop);
          var split = splitDateTime(this.datetime_stop);
          this.time_stop = split.time;
        }
        if (this.share) {
          this.share = new Share(this.share);
        }
      };
      EvntBase.prototype.updateDateTimes = function() {
        this.datetime_start = combineDateTime(this.date, this.time_start);
        this.datetime_stop = combineDateTime(this.date, this.time_stop);
      };
      return EvntBase;
    });
  
})();
