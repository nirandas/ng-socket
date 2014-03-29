/**
 * @author Nirandas Thavorath <nirandas@gmail.com>
 * copyright 2014
 * MIT license
 */

describe("NG socket", function() {
    var socket, scope, $timeout;

    beforeEach(module("ng-socket", function($socketProvider) {
        $socketProvider.configure({
            address: "test.foo"
        });
    }));
    beforeEach(inject(function($rootScope, $socket, _$timeout_) {
        /**
         * SockJS mock
         */
        window.SockJS = function(address) {
            this.send = jasmine.createSpy('sockjs.send');
            this.close = jasmine.createSpy('sockjs.close');
            this.address = address;
        };

        socket = $socket;
        scope = $rootScope;
        $timeout = _$timeout_;
    }));

    afterEach(inject(function($timeout) {
        $timeout.verifyNoPendingTasks();
    }));
    it("correctly uses the set address", function() {
        socket.start();
        expect(socket.socket()).toBeDefined();
        expect(socket.socket().address).toBe("test.foo");
    });

    it("fires $socket.open on onopen", function() {
        var openSpy = jasmine.createSpy();
        socket.on("open", openSpy);

        socket.start();
        socket.socket().onopen();

        expect(openSpy).toHaveBeenCalled();
    });

    it("Queues messages and sends them on open", function() {
        socket.start();
        socket.send("hello", "Nirandas");
        expect(socket.socket().send).not.toHaveBeenCalled();

        socket.socket().onopen();
        expect(socket.socket().send).toHaveBeenCalledWith(angular.toJson(["hello", "Nirandas"]));
    });

    describe("Open socket", function() {
        beforeEach(function() {
            socket.start();
            socket.socket().onopen();
        });

        it("sends the message", function() {
            socket.send("foo", "bar");
            expect(socket.socket().send).toHaveBeenCalled();
        });

        it("reconnects if connection breaks", function() {
            var openSpy = jasmine.createSpy();
            socket.on("open", openSpy);

            socket.socket().onclose();
            expect(socket.socket()).toBe(null);
            expect(openSpy).not.toHaveBeenCalled();

            $timeout.flush();
            socket.socket().onopen();

            expect(socket.socket()).toBeDefined();
            expect(openSpy).toHaveBeenCalled();
        });

        it("broadcasts received messages", function() {
            var messageSpy = jasmine.createSpy();
            socket.on("test", messageSpy);
            socket.socket().onmessage({
                data: angular.fromJson(["test", "foo"])
            });

            $timeout.flush();

            expect(messageSpy).toHaveBeenCalled();
        });

    });

});
