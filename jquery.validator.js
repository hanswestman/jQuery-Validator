/*
TODO:
	Test for min choices
	Test for max choices
	File input checks
*/

(function($){

	function Validator($form, options){
		var self = this;
		var defaults = {
			classValid: 'valid',
			classInvalid: 'invalid',
			classDisabled: 'disabled',
			classTouched: 'touched',
			classUntouched: 'untouched',
			invalidDisableSubmit: true
		};

		self.form = $form;
		self.submitButtons = self.form.find('[type="submit"]');
		self.options = $.extend(defaults, options);

		self.form.on('submit', function(){
			if(!self.form.hasClass(self.options.classValid)){
				return false;
			}
		});

		self.isAllValid = function(){
			var result = true;
			var $inputs = self.form.find('input,select,textarea').filter('[data-required]');

			//Test that all required fields has been validated
			if($inputs.length = $inputs.filter('.'+self.options.classValid+', .'+self.options.classInvalid).length){
				$inputs.each(function(){
					if($(this).hasClass(self.options.classInvalid)){
						result = false;
					}
				});
			} else {
				return false;
			}
			
			return result;
		};

		self.validateForm = function(){
			if(self.isAllValid()){
				self.submitButtons.removeClass(self.options.classDisabled);
				if(self.options.invalidDisableSubmit){
					self.submitButtons.prop('disabled', false);
				}
				self.form
					.removeClass(self.options.classInvalid)
					.addClass(self.options.classValid);
			} else {
				self.submitButtons.addClass(self.options.classDisabled);
				if(self.options.invalidDisableSubmit){
					self.submitButtons.prop('disabled', true);
				}
				self.form
					.removeClass(self.options.classValid)
					.addClass(self.options.classInvalid);
			}
		};

		self.validateInput = function($input){
			var tests = [];
			var $multipleInputs = false;

			//Test for value length
			if($input.is('[type="checkbox"]') && (!$input.attr('name') || self.form.find('input[type="checkbox"][name="'+$input.attr('name')+'"]').length == 1)){
				//If it's just a single checkbox we just need to check if it's checked
				tests.push($input.prop('checked'));
			} else if($input.is('[type="checkbox"]')){
				//Test multiple checkboxes
				var oneIsChecked = false;
				$multipleInputs = self.form.find('input[type="checkbox"][name="'+$input.attr('name')+'"]');
				$multipleInputs.each(function(i){
					if($(this).prop('checked')){
						oneIsChecked = true;
					}
				});
				tests.push(oneIsChecked);
			} else if($input.is('[type="radio"]')){
				//Test multiple radiobuttons
				var oneIsChecked = false;
				$multipleInputs = self.form.find('input[type="radio"][name="'+$input.attr('name')+'"]');
				$multipleInputs.each(function(i){
					if($(this).prop('checked')){
						oneIsChecked = true;
					}
				});
				tests.push(oneIsChecked);
			} else {
				tests.push($input.val().length > 0);
			}


			//Test for regexp match
			if($input.is('[data-pattern]')){
				var regexp = new RegExp($input.attr('data-pattern'));
				tests.push(regexp.test($input.val()));
			}

			//Test for max length
			if($input.is('[data-maxlength]')){
				tests.push($input.val().length <= parseInt($input.attr('data-maxlength')));
			}

			//Test for min length
			if($input.is('[data-minlength]')){
				tests.push($input.val().length >= parseInt($input.attr('data-minlength')));
			}

			var isValid = true;
			$.each(tests, function(i, val){
				if(!val){
					isValid = false;
				}
			});


			var $elementsToChange = !$multipleInputs ? $input : $multipleInputs;
			if(isValid){
				$elementsToChange
					.removeClass(self.options.classInvalid)
					.addClass(self.options.classValid);
			} else {
				$elementsToChange
					.removeClass(self.options.classValid)
					.addClass(self.options.classInvalid);
			}

			self.validateForm();
		};

		self.form.find('input,select,textarea').filter('[data-required]').each(function(){
			var $input = $(this);
			$input
				.addClass(self.options.classUntouched)
				.on('change', function(){
					if($input.hasClass(self.options.classUntouched)){
						$input
							.removeClass(self.options.classUntouched)
							.addClass(self.options.classTouched);
					}
					self.validateInput($input);
				});

			$input.filter(':not([type="radio"]):not([type="checkbox"]):not(select)')
				.on('keyup', function(){
					if($input.hasClass(self.options.classUntouched)){
						$input
							.removeClass(self.options.classUntouched)
							.addClass(self.options.classTouched);
					}
					self.validateInput($input);
				});

			//Initial check for prefilled values
			self.validateInput($input);
		});

		self.validateForm();
	}

	$.fn.validator = function(options){
		return this.each(function(){
			var $element = $(this);
			if($element.is('form')){
				$element.data('validator', new Validator($element, options));
			}
		});
	};

})(jQuery);