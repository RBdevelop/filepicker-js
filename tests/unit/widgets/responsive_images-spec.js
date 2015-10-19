describe('The responsive widgets module', function(){
    var origin = window.location.protocol + '//' + window.location.host,
        defaultSrc = 'https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
        changedSrc = 'https://www.filepicker.io/api/file/lYoRE2ehRniSoCaAx1p2',
        processBase = 'http://process.filepickercdn.com/l5uQ3k7FQ5GoYCHyTdZV/',
        processUrl = 'http://process.filepickercdn.com/l5uQ3k7FQ5GoYCHyTdZV/resize=width:615,height:100/other=test:testValue/https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY';



    function createEmptyImage(){
        var image = document.createElement('img');
        document.getElementsByTagName('body')[0].appendChild(image);
        image.setAttribute('width', '100');
        image.setAttribute('height', '100');
        return image;
    }

    function createImage(src){
        src = src || defaultSrc;
        var image = createEmptyImage();
        image.setAttribute('src', defaultSrc);
        return image;
    }

    function createWidgetImage(src){
        src = src || defaultSrc;
        var image = createEmptyImage()
        image.setAttribute('data-fp-src', defaultSrc);
        return image;
    }

    function getConstructedImage(attr){
        attr = attr || {};
        var image = createWidgetImage(),
            key;
        
        for (key in attr) {
            if (attr.hasOwnProperty(key)){
                image.setAttribute(key, attr[key]);
            }
        }

        image.setAttribute('src', processUrl);
        return image;
    }


    function triggerEvent(element, eventName){
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = eventName;
        }

        event.eventName = eventName;

        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + event.eventType, event);
        }
    }

    afterEach(function(){
        filepicker.responsiveImages.deactivate();
        try {
            if (image && image.parentNode) {
                // document.getElementsByTagName('body')[0].removeChild(image);
            }
        } catch(e){
            console.error(e);
        }
    });
    
    it("should be able to check DOM element dims", function(){
        expect(
            filepicker.responsiveImages.getElementDims(createImage())
        ).toEqual({ width: 100, height: 100 });
    });


    it("should be able to replace Image tag source value", function(){
        var image = createImage();
        expect(image.src).toEqual(defaultSrc);
        filepicker.responsiveImages.replaceSrc(image, changedSrc);
        expect(image.src).toEqual(changedSrc);

        filepicker.responsiveImages.replaceSrc(image, 'randomSrc');
        expect(image.src).toEqual(origin + '/randomSrc');
    });


    it("should return current resize params", function(){
        var image = createImage();
        var params = filepicker.responsiveImages.getCurrentResizeParams(processUrl);
        expect(params).toEqual({
            width: '615',
            height: '100'
        });
    });

    it('should be able to get and set responive options', function(){
        expect(filepicker.responsiveImages.getResponsiveOptions()).toEqual({});
        var newOptions = {
            pixelRound: 100,
            test: 'testValue',
        };
        filepicker.responsiveImages.setResponsiveOptions(newOptions);
        expect(filepicker.responsiveImages.getResponsiveOptions()).toEqual(newOptions);
    });


    it('should be able to init responsive view', function(done){
        var image = createWidgetImage();
        expect(image.src).toEqual('');
        filepicker.responsiveImages.activate();
        window.setTimeout(function(){
            expect(image.src).not.toEqual('');
            done();
        }, 250);
    });

    it('should be able to round numbers with step', function(){
        var scenarios = [
            {
                number: 10,
                round: 10,
                expected: 10
            },
            {
                number: 1,
                round: 100,
                expected: 100
            },
            {
                number: 999,
                round: 50,
                expected: 1000
            },
            {
                number: 444,
                round: 15,
                expected: 450
            },
            {
                number: 2424,
                round: 1,
                expected: 2424
            },
            {
                number: 424114241124421,
                round: 3,
                expected: 424114241124423
            },
            {
                number: 100,
                round: 0,
                expected: 100
            }
        ];
        scenarios.forEach(function(scenario){
            expect(filepicker.responsiveImages.roundWithStep(scenario.number, scenario.round)).toEqual(scenario.expected);
        });
    });


    it('should be able to construct responsive image widget src', function(){
        var image = createWidgetImage();
        expect(image.src).toEqual('');
        filepicker.responsiveImages.construct(image);
        expect(image.src).not.toEqual('');
    });


    it('should recognize if image url should be constructed based on global options and image attributes', function(){
        var scenarios = [{
                getElement:createEmptyImage,
                expected: true,
                options: {}
            },
            {
                getElement: getConstructedImage,
                expected: false,
                options: {onResize:'none'}
            },
            {
                getElement: getConstructedImage,
                expected: true,
                options: {onResize:'down'}
            },
            {
                getElement: getConstructedImage,
                expected: false,
                options: {onResize:'up'}
            },
            {
                getElement:function(){
                    return getConstructedImage({'data-fp-on-resize': 'none'})
                },
                expected: false,
                options: {}
            },
            {
                getElement:function(){
                    return getConstructedImage({'data-fp-on-resize': 'all'})
                },
                expected: true,
                options: {onResize:'none'}
            },
            {
                getElement:function(){
                    return getConstructedImage({'data-fp-on-resize': 'up'})
                },
                expected: false,
                options: {onResize:'down'}
            },
            {
                getElement:function(){
                    return getConstructedImage({'data-fp-on-resize': 'down'})
                },
                expected: true,
                options: {onResize:'up'}
            }
        ];

        scenarios.forEach(function(scenario){
            filepicker.setResponsiveOptions(scenario.options || {});
            expect(filepicker.responsiveImages.shouldConstruct(scenario.getElement())).toEqual(scenario.expected);
        });

    });


    it('should listen for window resize', function(){
        var onWindowResize = jasmine.createSpy("onWindowResize");

        filepicker.responsiveImages.addWindowResizeEvent(onWindowResize);

        expect(onWindowResize).not.toHaveBeenCalled();
        triggerEvent(window, 'resize');
        expect(onWindowResize).toHaveBeenCalled();
        filepicker.responsiveImages.removeWindowResizeEvent(onWindowResize);
        onWindowResize.calls.reset();
        triggerEvent(window, 'resize');
        expect(onWindowResize).not.toHaveBeenCalled();
    });

});
