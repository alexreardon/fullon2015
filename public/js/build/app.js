/*! stphils-fullon2015 - v1.0.0 - 19-10-2014 */window.fullon={views:{register:{}},state:{},routers:{},vent:_.extend({},Backbone.Events)},fullon.views.feature_detect=Backbone.View.extend({initialize:function(){this.$modal=$(".upgrade-modal")},isBrowserSupported:function(){if(!Modernizr.mq("only all"))return!1;var minimum_features=["backgroundsize","opacity","cssanimations","generatedcontent","cssgradients","csstransitions","csstransforms"];return _.every(minimum_features,function(feature){return Modernizr[feature]===!0})},showUpgradeBrowserModal:function(){this.$modal.modal({keyboard:!1,backdrop:"static"})}}),fullon.views.common=Backbone.View.extend({initialize:function(){this.$full_screen=$(".l-full-screen"),this.$nav=$(".nav-bar"),this.throttled_resize=_.debounce(this.resize,100),this.resize(),$(".datepicker").datepicker({format:"dd/mm/yyyy",autoclose:!0}),$(window).on("resize",function(){this.throttled_resize()}.bind(this))},resize:function(){console.log("window resize - common");var height=this.get_min_height();this.$full_screen.css("min-height",height)},get_min_height:function(){return $(window).height()-this.$nav.height()}}),function(){var feature_detector=new fullon.views.feature_detect;if(!feature_detector.isBrowserSupported())return console.warn("browser not supported"),feature_detector.showUpgradeBrowserModal();console.log("browser supported, lets do this!");new fullon.views.common}(),function(exports){var regex={email:/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/,number:/^\d+$/,letters:/^[a-zA-Z]+[a-zA-Z\s'-]*$/,date:/^[\d]{2}\/[\d]{2}\/[\d]{4}$/,money:/^[\d,]+?$/},rules={min_length:{fn:function(input,length){return input&&input.length&&input.length>=length||!1},text:"must be at least {0} characters in length"},max_length:{fn:function(input,length){return input&&input.length&&input.length<=length||!1},text:"cannot be longer then {0} characters"},required:{fn:function(input){return input&&input.length&&input.length>0||!1},text:"this is a required field"},is_letters:{fn:function(input){return regex.letters.test(input)},text:"must be letters only"},is_numbers:{fn:function(input){return regex.number.test(input)},text:"must be numbers only"},is_email:{fn:function(input){return regex.email.test(input)},text:"must be in email format (eg 'example@email.com')"},is_date:{fn:function(input){return regex.date.test(input)},text:"date is expected the format: DD/MM/YYYY"},is_money:{fn:function(input){return regex.money.test(input)},text:"money is expected in the format: 10 or 10,000 or 10000 (no '$' or decimal points)"},value:{fn:function(input,value){return input===value},text:"value must be '{0}'"}};return"undefined"!=typeof module?void(module.exports=exports=rules):void("undefined"!=typeof window&&window.fullon&&(window.fullon.validation=rules))}(),fullon.views.index=Backbone.View.extend({initialize:function(){this.$nav_bar=$(".fo-navbar"),this.$landing=$(".landing"),this.$landing_video=$(".landing-video"),this.landing_video=this.$landing_video[0],this.$trailer_video_launch=$(".trailer-video-launch"),this.$trailer_video=$("#trailer-video"),this.$f_trailer_video_iframe=$f(this.$trailer_video[0]),this.$f_trailer_video_iframe.addEvent("ready",function(player_id){this.onTrailerVideoReady(player_id)}.bind(this)),this.$trailer_video_launch.on("click",function(){this.showTrailer()}.bind(this)),this.landing_video.oncanplay=function(){this.onLandingVideoReady()}.bind(this)},onLandingVideoReady:function(){this.$landing_video.addClass("is-ready"),this.landing_video.play(),console.log("playing video")},showTrailer:function(){console.log("show trailer"),this.setTrailerMode(!0)},onTrailerVideoReady:function(player_id){this.$f_trailer_video_iframe.addEvent("finish",this.onTrailerFinished.bind(this)),this.$f_trailer_video_iframe.addEvent("pause",this.onTrailerPaused.bind(this)),this.$f_trailer_video_iframe.addEvent("play",this.onTrailerPlayed.bind(this)),this.$trailer_video_launch.addClass("is-ready"),console.log("trailer is ready to be played",player_id)},onTrailerFinished:function(){console.log("trailer finished"),this.setTrailerMode(!1)},onTrailerPaused:function(){this.$nav_bar.removeClass("is-trailer-playing"),console.log("trailer paused")},onTrailerPlayed:function(){this.$nav_bar.addClass("is-trailer-playing"),console.log("trailer played")},setTrailerMode:function(show){var method=show?"addClass":"removeClass";this.$landing[method]("is-trailer-playing"),this.$nav_bar[method]("is-trailer-playing"),show?(this.$trailer_video_launch.attr("disabled","disabled"),this.$f_trailer_video_iframe.api("play")):(this.$trailer_video_launch.removeAttr("disabled"),this.$f_trailer_video_iframe.api("unload"))}}),fullon.views.register.common=Backbone.View.extend({initialize:function(){this.$inputs=$("input"),this.$camper_type_radio=$("input[name=camper_type]"),this.$next_buttons=$(".navigation .btn[data-action=next]");var self=this;this.listenTo(fullon.vent,"input:validate",function($el){self.validate_item($el.closest(".form-group")),self.check_if_button_can_be_re_enabled($el.closest("section"))}),this.listenTo(fullon.vent,"input:validate_section",function($section,cb){var success=this.validation_section($section);cb(success)}),this.$inputs.on("change",function(){console.log("input [change] event fired"),fullon.vent.trigger("input:validate",$(this))}),this.$inputs.on("focusout",function(){console.log("input [focusout] event fired - not processing")}),this.$next_buttons.on("click",function(event){event.preventDefault(),event.stopPropagation();var $section=$(this).closest("section"),success=self.validation_section($section);success&&fullon.vent.trigger("navigate:next",$section)}),this.$form_groups=$(".form-group"),fullon.vent.on("camper_type:change",this.on_camper_type_change,this)},on_camper_type_change:function(){var camper_type=fullon.state.camper_type;this.$form_groups.each(function(){var $this=$(this),available_to=$this.attr("data-available-to");return available_to?(available_to=available_to.split("|"),void(_.contains(available_to,camper_type)?($this.removeClass("hide"),$this.closest(".discount_row").removeClass("hide")):($this.addClass("hide"),$this.closest(".discount_row").addClass("hide")))):!0})},validation_section:function($section){var $form_groups=$section.find(".form-group:visible"),success=!0,self=this;return $form_groups.each(function(){self.validate_item($(this))||(success=!1)}),this.enable_navigation_buttons($section,success),success},validate_item:function($form_group){var val,$inputs=$form_group.find("input, textarea, select");val=$inputs.length>1?$form_group.find("input:checked").val():$inputs.val();var rules=$form_group.attr("data-validation");if(!rules)return!0;rules=rules.split("|");var success=!0,required=_.contains(rules,"required:true");return(required||!required&&""!==val)&&(success=_.every(rules,function(rule){var components=rule.split(":"),rule_name=components[0],rule_param=components[1];return fullon.validation[rule_name].fn(val,rule_param)})),success?($form_group.attr("data-valid",!0),$form_group.removeClass("has-error"),$form_group.find(".validation_message").removeClass("show").addClass("hide")):($form_group.attr("data-valid",!1),$form_group.addClass("has-error"),$form_group.find(".validation_message").removeClass("hide").addClass("show")),success},check_if_button_can_be_re_enabled:function($section){var $invalid_groups=$section.find(".form-group[data-valid=false]:visible");this.enable_navigation_buttons($section,$invalid_groups.length?!1:!0)},enable_navigation_buttons:function($section,enable){console.log("enable navigation buttons",enable);var $navigation=$section.find(".navigation");enable?($navigation.find(".btn[data-action=next]").attr("disabled",!1).removeClass("btn-danger"),$navigation.find(".navigation_cant_continue").addClass("hide")):($navigation.find(".btn[data-action=next]").attr("disabled",!0).addClass("btn-danger"),$navigation.find(".navigation_cant_continue").removeClass("hide"))}}),fullon.views.register.allegiance=Backbone.View.extend({initialize:function(){this.$section=$("#allegiance"),this.$camper_types=$("input:radio[name=camper_type]"),this.$camper_type_labels=$(".camper_type_label"),this.$camper_type_flags=$(".camper_type_flag"),this.$navigation_button_container=$("#allegiance_navigation_container","#allegiance"),this.$camper_type_row=$("#camper_type_row","#allegiance");var self=this;$(".allegiance-btn").on("click",function(event){event.stopPropagation(),self.allegiance_toggle($(this).attr("data-id"))}),this.$camper_type_row.removeClass("invisible")},constants:{flag:function(){var prefix="camper_type_flag_";return{prefix:prefix,regex:new RegExp("^"+prefix)}}()},allegiance_toggle:function(camper_type){fullon.state.camper_type=camper_type,console.log("selecting camper type: ",fullon.state.camper_type),this.$camper_types.each(function(){$(this).prop("checked",!1)}),this.$camper_types.filter("[value="+fullon.state.camper_type+"]").prop("checked",!0),this.$camper_type_labels.text(fullon.state.camper_type),fullon.vent.trigger("camper_type:change"),fullon.vent.trigger("navigate:next",this.$section)}}),fullon.views.register.basic=Backbone.View.extend({initialize:function(){this.$basic_fields=$("input[name=first_name], input[name=last_name], input[name=email]","#basic"),this.$basic_fields.on("change",function(){console.log("basic info updated - update auto complete fields"),fullon.vent.trigger("basic_info:update")}),fullon.vent.on("chocolate_dropdown:change",this.on_chocolate_dropdown_change,this),fullon.vent.on("chocolate_dropdown:remove",this.on_chocolate_dropdown_remove,this)},on_chocolate_dropdown_remove:function(){console.log("basic: on_chocolate_dropdown_remove"),this.$basic_fields.filter("[name=first_name]").val("").attr("disabled",!1),this.$basic_fields.filter("[name=last_name]").val("").attr("disabled",!1)},on_chocolate_dropdown_change:function(data){console.log("basic: on_chocolate_dropdown_change",data),this.$basic_fields.filter("[name=first_name]").val(data.first_name).attr("disabled",!0).trigger("change"),this.$basic_fields.filter("[name=last_name]").val(data.last_name).attr("disabled",!0).trigger("change"),fullon.vent.trigger("basic_info:update")}}),fullon.views.register.costs=Backbone.View.extend({selectors:{section:"#costs",radio_discount:"input[name=chocolate]",dropdown:"#discount_chocolate_dropdown",camp_fee:".camp_fee",camp_fee_total:".camp_fee_total",row:".row",discount_display:".discount_amount",row_amount_display:".amount_display",data:{current_value:"data-current-value"}},initialize:function(){this.$discount_inputs=$("input:radio:not("+this.selectors.radio_discount+")",this.selectors.section),this.$donation_input=$("input[name=donation]"),this.$dropdown_toggle=$(this.selectors.radio_discount,this.selectors.section),this.$dropdown=$(this.selectors.dropdown,this.selectors.section),this.$camp_fee=$(this.selectors.camp_fee,this.selectors.section),this.$camp_fee_total=$(this.selectors.camp_fee_total),this.$discount_displays=$(this.selectors.discount_display,this.selectors.section);var self=this;this.$dropdown_toggle.on("change",function(){var show="yes"===$(this).val();self.show_dropdown(show),self.use_dropdown(show)}),this.$dropdown.on("change",function(){self.use_dropdown(!0)}),this.$discount_inputs.on("change",function(){self.update_discount_item($(this))}),this.$donation_input.on("focusout",function(){self.update_donantion_item()}),this.listenTo(fullon.vent,"camper_type:change",this.on_camper_type_change)},on_camper_type_change:function(){var fee=fullon.config.camper_types[fullon.state.camper_type].fee;this.$camp_fee.attr(this.selectors.data.current_value,fee),this.$camp_fee.text("$"+fee),this.update_fee_total()},is_donation_input_valid:function(){return!this.$donation_input.closest(".form-group[data-valid=false]").length&&""!==this.$donation_input.val()},update_donantion_item:function(){setTimeout(function(){return this.is_donation_input_valid()?this.set_row_amount(this.$donation_input,this.$donation_input.val()):this.set_row_amount(this.$donation_input,0)}.bind(this),0)},update_discount_item:function($el){console.log("input item has been toggled");var name=$el.attr("name"),add="yes"===$el.val(),val=add?fullon.config.discounts[name].amount:0;this.set_row_amount($el,val)},set_row_amount:function($el,val){$el.closest(this.selectors.row).find(this.selectors.row_amount_display).attr(this.selectors.data.current_value,val).text("$"+val),this.update_fee_total()},update_fee_total:function(){var self=this,fee=fullon.config.camper_types[fullon.state.camper_type].fee,visible_discounts=this.$discount_displays.filter(function(){return!$(this).closest(".form-group").hasClass("hide")});if(visible_discounts.each(function(){fee-=parseFloat($(this).attr(self.selectors.data.current_value))}),this.is_donation_input_valid()){var donation=parseFloat(this.$donation_input.val());_.isNumber(donation)&&(fee+=donation)}fee=0>fee?0:fee,this.$camp_fee_total.attr(this.selectors.data.current_value,fee).text("$"+fee)},use_dropdown:function(show){var val=Number(this.$dropdown.val());_.isNumber(val)&&(val=0);var total=fullon.config.discounts.chocolate.amount*val;if(this.set_row_amount(this.$dropdown,show?total:0),show){var $selected=$(this.$dropdown.find(":selected"));fullon.vent.trigger("chocolate_dropdown:change",{first_name:$selected.attr("data-first-name"),last_name:$selected.attr("data-last-name")})}},show_dropdown:function(show){this.$dropdown.closest(".form-group").removeClass(show?"hide":"show").addClass(show?"show":"hide"),show||fullon.vent.trigger("chocolate_dropdown:remove")}}),fullon.views.register.payment=Backbone.View.extend({initialize:function(){this.$payer_radios=$("input[name=is_payer_registering]","#payment"),this.$camper_first_name=$("input[name=first_name]","#basic"),this.$camper_last_name=$("input[name=last_name]","#basic"),this.$payer_first_name=$("input[name=payer_first_name]","#payment"),this.$payer_last_name=$("input[name=payer_last_name]","#payment");var self=this;this.$payer_radios.on("change",function(){self.autofill_payer_details()}),fullon.vent.on("basic_info:update",this.autofill_payer_details,this)},update_autofill_field:function($el,val,disabled){$el.val(val).attr("disabled",disabled),disabled&&$el.trigger("change")},autofill_payer_details:function(){console.log("auto fill details"),"yes"===this.$payer_radios.filter(":checked").val()?(this.update_autofill_field(this.$payer_first_name,this.$camper_first_name.val(),!0),this.update_autofill_field(this.$payer_last_name,this.$camper_last_name.val(),!0)):(this.update_autofill_field(this.$payer_first_name,"",!1),this.update_autofill_field(this.$payer_last_name,"",!1))}}),fullon.routers.register=Backbone.Router.extend({initialize:function(){this.common=new fullon.views.register.common,this.allegiance=new fullon.views.register.allegiance,this.costs=new fullon.views.register.costs,this.basic=new fullon.views.register.basic,this.payment=new fullon.views.register.payment,this.$form=$("form"),this.$sections=$("section"),this.$all_inputs=$("input, textarea, select"),this.$nav_buttons=$(".register-nav .nav li"),this.$back_buttons=$(".navigation .btn[data-action=back]"),this.$next_buttons=$(".navigation .btn[data-action=next]");var bypass_refresh_check=!1;window.onbeforeunload=function(){return bypass_refresh_check?void 0:(bypass_refresh_check=!1,"Data will be lost if you leave/refresh the page")};var self=this;this.$form.on("submit",function(){console.log("attempting to submit form"),self.stopListening(),self.$all_inputs.attr("disabled",!1),self.$back_buttons.addClass("disabled"),self.$next_buttons.addClass("disabled"),self.$nav_buttons.find("a").off("click"),bypass_refresh_check=!0}),this.$back_buttons.on("click",function(event){event.preventDefault(),event.stopPropagation();var $section=$(this).closest("section");self.on_navigate_previous($section)}),this.$nav_buttons.find("a").on("click",function(event){event.preventDefault(),event.stopPropagation(),self.on_nav_button_click($(this).closest("li"))}),this.listenTo(fullon.vent,"navigate:next",this.on_navigate_next),this.listenTo(fullon.vent,"camper_type:change",this.on_camper_type_change)},navigate_ui:function($current,$next,forward){var $current_tab=this.$nav_buttons.find("a[data-section="+$current.attr("id")+"]").closest("li");$current_tab.removeClass("active"),forward?$current_tab.removeClass("partially_completed").addClass("done"):$current_tab.hasClass("done")||$current_tab.addClass("partially_completed");var $next_tab=this.$nav_buttons.find("a[data-section="+$next.attr("id")+"]").closest("li");$next_tab.removeClass("pending").addClass("active"),$current.hide(),$next.show(),$(window).scrollTop(0)},on_navigate_previous:function($section){var $prev=$section.prev();$prev.length&&this.navigate_ui($section,$prev,!1)},on_navigate_next:function($section){var $next=$section.next();return $next.length?this.navigate_ui($section,$next,!0):void this.$form.submit()},on_nav_button_click:function($li){if(!$li.hasClass("pending")){var $current_section=this.$sections.filter(":visible"),target_id=$li.find("a").attr("data-section");if(target_id!==$current_section.attr("id")){var $target_section=this.$sections.filter(function(){return $(this).attr("id")===target_id}),forward=this.$sections.index($current_section)<this.$sections.index($target_section);fullon.vent.trigger("input:validate_section",$current_section,function(success){return forward?void(success?($li.removeClass("partially_complete"),this.navigate_ui($current_section,$target_section,!0)):window.alert("cannot continue forward until this section is valid")):this.navigate_ui($current_section,$target_section,!1)}.bind(this))}}},on_camper_type_change:function(){var first=!0;this.$nav_buttons.each(function(){return first?void(first=!1):void $(this).removeClass("partially_completed done").addClass("pending")})}});