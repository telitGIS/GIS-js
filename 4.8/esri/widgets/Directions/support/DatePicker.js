// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See https://js.arcgis.com/4.8/esri/copyright.txt for details.
//>>built
define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper dojo/i18n!../nls/DatePicker dojo/keys ../../../moment ../../../core/accessorSupport/decorators ../../Widget ./DatePickerViewModel ../../support/widget".split(" "),function(y,z,q,f,g,c,l,k,w,m,d){var x=[c.DOWN_ARROW,c.END,c.ENTER,c.HOME,c.LEFT_ARROW,c.PAGE_DOWN,c.PAGE_UP,c.RIGHT_ARROW,c.SPACE,c.UP_ARROW];return function(n){function b(a){a=n.call(this)||this;a._activeDate=null;a._calendarNode=
null;a._closedByUserAction=!1;a._isOpen=!1;a._rootNode=null;a.value=null;a.viewModel=new m;return a}q(b,n);b.prototype.render=function(){var a,b=this.viewModel.value.format("L"),p=this._isOpen,c=(a={},a["esri-icon-down-arrow"]=!p,a["esri-icon-up-arrow"]=p,a);return d.tsx("div",{afterCreate:d.storeNode,bind:this,class:"esri-date-picker esri-widget","data-node-ref":"_rootNode"},d.tsx("div",{afterUpdate:this._focusSelectedOrClosed,"aria-pressed":p.toString(),bind:this,class:this.classes("esri-widget--button",
"esri-date-picker__calendar-toggle"),onclick:this._toggle,onkeydown:this._toggle,role:"button",tabIndex:0},d.tsx("span",{class:"esri-date-picker__date"},b),d.tsx("span",{"aria-hidden":"true",class:this.classes(c)})),p?this._renderCalendar():null)};b.prototype._focusSelectedOrClosed=function(a){this._closedByUserAction&&(this._closedByUserAction=!1,a.focus())};b.prototype._handleDatePickerKeydown=function(a){a.keyCode===c.ESCAPE&&(this._closedByUserAction=!0,this._close(),a.preventDefault(),a.stopPropagation())};
b.prototype._renderCalendar=function(){var a=this._activeDate,b=this.get("viewModel.value");return d.tsx("div",{afterCreate:d.storeNode,bind:this,class:"esri-date-picker__calendar","data-node-ref":"_calendarNode",key:"esri-date-picker__calendar",onkeydown:this._handleDatePickerKeydown},this._renderMonthPicker(a),this._renderDayPicker(a,b),this._renderYearPicker(a))};b.prototype._handleDatePickerBlur=function(a){a=a.relatedTarget;this._calendarNode.contains(a)||this._rootNode.contains(a)||this._close()};
b.prototype._renderMonthPicker=function(a){var b=l.months().map(function(b,h){h=a.month()===h;return d.tsx("option",{selected:h},b)});return d.tsx("div",{class:"esri-date-picker__month-picker"},d.tsx("div",{"aria-label":g.goToPreviousMonth,bind:this,class:"esri-widget--button",onblur:this._handleDatePickerBlur,onclick:this._setPreviousMonth,onkeydown:this._setPreviousMonth,role:"button",tabIndex:0,title:g.goToPreviousMonth},d.tsx("span",{"aria-hidden":"true",class:"esri-icon-left"})),d.tsx("select",
{"aria-live":"assertive",bind:this,class:"esri-date-picker__month-dropdown",id:this.id+"__month-picker",onblur:this._handleDatePickerBlur,onchange:this._setMonth,onkeydown:this._setMonth},b),d.tsx("div",{"aria-label":g.goToNextMonth,bind:this,class:"esri-widget--button",onblur:this._handleDatePickerBlur,onclick:this._setNextMonth,onkeydown:this._setNextMonth,role:"button",tabIndex:0,title:g.goToNextMonth},d.tsx("span",{"aria-hidden":"true",class:"esri-icon-right"})))};b.prototype._renderDayPicker=
function(a,b){var h=this,c=a.clone().day(l.localeData().firstDayOfWeek()),c=this._getWeekLabels(c),e=this._getDayId(a);a=this._renderMonth(a,b);return d.tsx("div",{afterCreate:this._handleDayPickerCreate,"aria-activedescendant":e,"aria-labelledby":this.id+"__month-picker "+this.id+"__selected-year",bind:this,class:"esri-date-picker__day-picker",id:this.id+"__day-picker",onblur:this._handleDatePickerBlur,onkeydown:this._handleDayPickerKeydown,role:"grid",tabIndex:0},d.tsx("div",{class:"esri-date-picker__week-item",
role:"row"},c.map(function(a){return d.tsx("div",{"aria-label":a.name,class:h.classes("esri-date-picker__day-item","esri-date-picker__day-item--header"),role:"columnheader",title:a.name},a.abbr)})),a)};b.prototype._getDayId=function(a){return this.id+"__"+a.format("YYYY-MM-DD")};b.prototype._handleDayPickerCreate=function(a){a.focus()};b.prototype._getWeekLabels=function(a){for(var b=[],d=0;7>d;d++)b.push({name:a.format("dddd"),abbr:a.format("dd")}),a.add(1,"day");return b};b.prototype._handleDayPickerKeydown=
function(a){var b=a.keyCode,d=a.ctrlKey,f=a.shiftKey,e=this._activeDate;if(-1!==x.indexOf(b)){if(b===c.LEFT_ARROW)e.subtract(1,"day");else if(b===c.RIGHT_ARROW)e.add(1,"day");else if(b===c.UP_ARROW)e.subtract(1,"week");else if(b===c.DOWN_ARROW)e.add(1,"week");else if(b===c.PAGE_UP)e.subtract(1,f?"year":"month");else if(b===c.PAGE_DOWN)e.add(1,f?"year":"month");else if(b===c.HOME)e.startOf(d?"year":"month");else if(b===c.END)e.endOf(d?"year":"month");else if(b===c.ENTER||b===c.SPACE)this.viewModel.value=
e.clone(),this._closedByUserAction=!0,this._close();a.preventDefault();a.stopPropagation()}};b.prototype._renderMonth=function(a,b){for(var c,f=l(),e=l.localeData(),h=a.clone().startOf("month"),g=a.clone().endOf("month"),e=h.clone().subtract(h.weekday()-e.firstDayOfWeek(),"day"),k=[],m=0;6>m;m++){for(var n=[],t=0;7>t;t++){var u=e.date(),v=e.isSame(a,"day"),r=e.isSame(b,"day"),q=this._getDayId(e),r=(c={},c["esri-date-picker__day-item--nearby-month"]=!e.isBetween(h,g,null,"[]"),c["esri-date-picker__day-item--today"]=
e.isSame(f,"day"),c["esri-date-picker__day-item--active"]=v,c["esri-date-picker__day-item--selected"]=r,c);n.push(d.tsx("div",{"aria-label":u.toString(),"aria-selected":v.toString(),bind:this,class:this.classes("esri-date-picker__day-item",r),"data-iso-date":e.toISOString(),id:q,onclick:this._handleSelectedDate,onkeydown:this._handleSelectedDate,role:"gridcell"},u));e.add(1,"day")}k.push(d.tsx("div",{class:"esri-date-picker__week-item",role:"row"},n))}return k};b.prototype._renderYearPicker=function(a){var b=
a.clone();a=b.format("YYYY");var c=b.add(1,"year").format("YYYY"),b=b.subtract(2,"year").format("YYYY");return d.tsx("div",{class:"esri-date-picker__year-picker"},d.tsx("div",{"aria-label":g.goToPreviousYear,bind:this,class:"esri-date-picker__year-picker-item",onblur:this._handleDatePickerBlur,onclick:this._setPreviousYear,onkeydown:this._setPreviousYear,tabIndex:0,title:g.goToPreviousYear},b),d.tsx("div",{class:this.classes("esri-date-picker__year-picker-item","esri-date-picker__year-picker-item--selected"),
id:this.id+"__selected-year"},a),d.tsx("div",{"aria-label":g.goToNextYear,bind:this,class:"esri-date-picker__year-picker-item",onblur:this._handleDatePickerBlur,onclick:this._setNextYear,onkeydown:this._setNextYear,tabIndex:0,title:g.goToNextYear},c))};b.prototype._toggle=function(){this._isOpen?this._close():this._open(this.viewModel.value.clone())};b.prototype._setMonth=function(a){this._activeDate.month(a.target.value)};b.prototype._close=function(){this._activeDate=null;this._isOpen=!1};b.prototype._open=
function(a){this._activeDate=a;this._isOpen=!0};b.prototype._setPreviousMonth=function(){this._activeDate.subtract(1,"month")};b.prototype._setNextMonth=function(){this._activeDate.add(1,"month")};b.prototype._setPreviousYear=function(){this._activeDate.subtract(1,"year")};b.prototype._setNextYear=function(){this._activeDate.add(1,"year")};b.prototype._handleSelectedDate=function(a){this.viewModel.value=l(a.target.getAttribute("data-iso-date"));this._closedByUserAction=!0;this._close()};f([k.aliasOf("viewModel.value")],
b.prototype,"value",void 0);f([k.property({type:m}),d.renderable("viewModel.value")],b.prototype,"viewModel",void 0);f([d.accessibleHandler()],b.prototype,"_toggle",null);f([d.accessibleHandler()],b.prototype,"_setPreviousMonth",null);f([d.accessibleHandler()],b.prototype,"_setNextMonth",null);f([d.accessibleHandler()],b.prototype,"_setPreviousYear",null);f([d.accessibleHandler()],b.prototype,"_setNextYear",null);f([d.accessibleHandler()],b.prototype,"_handleSelectedDate",null);return b=f([k.subclass("esri.widgets.Directions.support.DatePicker")],
b)}(k.declared(w))});