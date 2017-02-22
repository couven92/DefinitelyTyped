
/// <reference types="jquery" />
/// <reference types="jqueryui" />

// https://developer.chrome.com/extensions/examples/api/bookmarks/basic/popup.js
function bookmarksExample() {
    $(function () {
        $('#search').change(function () {
            $('#bookmarks').empty();
            dumpBookmarks($('#search').val());
        });
    });
    // Traverse the bookmark tree, and print the folder and nodes.
    function dumpBookmarks(query?) {
        var bookmarkTreeNodes = chrome.bookmarks.getTree(
            function (bookmarkTreeNodes) {
                $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
            });
    }
    function dumpTreeNodes(bookmarkNodes, query) {
        var list = $('<ul>');
        var i;
        for (i = 0; i < bookmarkNodes.length; i++) {
            list.append(dumpNode(bookmarkNodes[i], query));
        }
        return list;
    }
    function dumpNode(bookmarkNode, query) {
        var span = $('<span>');
        if (bookmarkNode.title) {
            if (query && !bookmarkNode.children) {
                if (String(bookmarkNode.title).indexOf(query) == -1) {
                    return $('<span></span>');
                }
            }
            var anchor = $('<a>');
            anchor.attr('href', bookmarkNode.url);
            anchor.text(bookmarkNode.title);
            /*
             * When clicking on a bookmark in the extension, a new tab is fired with
             * the bookmark url.
             */
            anchor.click(function () {
                chrome.tabs.create({ url: bookmarkNode.url });
            });
            var options = bookmarkNode.children ?
                $('<span>[<a href="#" id="addlink">Add</a>]</span>') :
                $('<span>[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
                    'href="#">Delete</a>]</span>');
            var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
                '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
                '</td></tr></table>') : $('<input>');
            // Show add and edit links when hover over.
            span.hover(function () {
                span.append(options);
                $('#deletelink').click(function () {
                    $('#deletedialog').empty().dialog({
                        autoOpen: false,
                        title: 'Confirm Deletion',
                        resizable: false,
                        height: 140,
                        modal: true,
                        buttons: {
                            'Yes, Delete It!': function () {
                                chrome.bookmarks.remove(String(bookmarkNode.id));
                                span.parent().remove();
                                $(this).dialog('destroy');
                            },
                            Cancel: function () {
                                $(this).dialog('destroy');
                            }
                        }
                    }).dialog('open');
                });
                $('#addlink').click(function () {
                    $('#adddialog').empty().append(edit).dialog({
                        autoOpen: false,
                        closeOnEscape: true, title: 'Add New Bookmark', modal: true,
                        buttons: {
                            'Add': function () {
                                chrome.bookmarks.create({
                                    parentId: bookmarkNode.id,
                                    title: $('#title').val(), url: $('#url').val()
                                });
                                $('#bookmarks').empty();
                                $(this).dialog('destroy');
                                dumpBookmarks();
                            },
                            'Cancel': function () {
                                $(this).dialog('destroy');
                            }
                        }
                    }).dialog('open');
                });
                $('#editlink').click(function () {
                    edit.val(anchor.text());
                    $('#editdialog').empty().append(edit).dialog({
                        autoOpen: false,
                        closeOnEscape: true, title: 'Edit Title', modal: true,
                        show: 'slide', buttons: {
                            'Save': function () {
                                chrome.bookmarks.update(String(bookmarkNode.id), {
                                    title: edit.val()
                                });
                                anchor.text(edit.val());
                                options.show();
                                $(this).dialog('destroy');
                            },
                            'Cancel': function () {
                                $(this).dialog('destroy');
                            }
                        }
                    }).dialog('open');
                });
                options.fadeIn();
            },
                // unhover
                function () {
                    options.remove();
                }).append(anchor);
        }
        var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
        if (bookmarkNode.children && bookmarkNode.children.length > 0) {
            li.append(dumpTreeNodes(bookmarkNode.children, query));
        }
        return li;
    }

    document.addEventListener('DOMContentLoaded', function () {
        dumpBookmarks();
    });
}

// https://developer.chrome.com/extensions/examples/api/browserAction/make_page_red/background.js
function pageRedder() {
    chrome.browserAction.onClicked.addListener(function (tab) {
        // No tabs or host permissions needed!
        console.log('Turning ' + tab.url + ' red!');
        chrome.tabs.executeScript({
            code: 'document.body.style.backgroundColor="red"'
        });
    });
}

// https://developer.chrome.com/extensions/examples/api/browserAction/print/background.js
function printPage() {
    chrome.browserAction.onClicked.addListener(function (tab) {
        var action_url = "javascript:window.print();";
        chrome.tabs.update(tab.id!, { url: action_url });
    });
}

// https://developer.chrome.com/extensions/examples/extensions/catblock/background.js
function catBlock() {
    var loldogs: string[];
    chrome.webRequest.onBeforeRequest.addListener(
        function (info) {
            console.log("Cat intercepted: " + info.url);
            // Redirect the lolcal request to a random loldog URL.
            var i = Math.round(Math.random() * loldogs.length);
            return { redirectUrl: loldogs[i] };
        },
        // filters
        {
            urls: [
                "https://i.chzbgr.com/*"
            ],
            types: ["image"]
        },
        // extraInfoSpec
        ["blocking"]);
}

// webNavigation.onBeforeNavigate.addListener example similar api to onBeforeRequest but without extra spec
function beforeRedditNavigation() {
    chrome.webNavigation.onBeforeNavigate.addListener(function (requestDetails) {
        console.log("URL we want to redirect to: " + requestDetails.url);
        // NOTE: This will search for top level frames with the value -1.
        if (requestDetails.parentFrameId != -1) {
            return;
        }

        let url = new URL(requestDetails.url);
        let splitUrl = url.hostname.split('.');
        //` Note: Does not cover the XX.co.uk type edge case
        let host = (splitUrl[(splitUrl.length - 1) - 1]);

        if (host === null) {
            return;
        } else if (host === "reddit") {
            alert("Were you trying to go on reddit, during working hours? :(")
            return;
        }
    }, { urls: ["http://*/*"], types: ["image"] });
}

// contrived settings example
function proxySettings() {
    chrome.proxy.settings.get({ incognito: true }, (details) => {
        var val = details.value;
        var level: string = details.levelOfControl;
        var incognito: boolean = details.incognitoSpecific!;
    });

    // bare minimum set call
    chrome.proxy.settings.set({ value: 'something' });

    // add a scope and callback
    chrome.proxy.settings.set({
        value: 'something',
        scope: 'regular'
    }, () => { });

    chrome.proxy.settings.clear({});

    // clear with a scope set
    chrome.proxy.settings.clear({ scope: 'regular' });
}

// https://developer.chrome.com/extensions/examples/api/contentSettings/popup.js
function contentSettings() {
    var incognito;
    var url;

    function settingChanged() {
        var type = this.id;
        var setting = this.value;
        var pattern = /^file:/.test(url) ? url : url.replace(/\/[^\/]*?$/, '/*');
        console.log(type + ' setting for ' + pattern + ': ' + setting);
        // HACK: [type] is not recognised by the docserver's sample crawler, so
        // mention an explicit
        // type: chrome.contentSettings.cookies.set - See http://crbug.com/299634
        chrome.contentSettings[type].set({
            'primaryPattern': pattern,
            'setting': setting,
            'scope': (incognito ? 'incognito_session_only' : 'regular')
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        chrome.tabs.query({ active: true, currentWindow: true, url: ['http://*/*', 'https://*/*'] }, function (tabs) {
            var current = tabs[0];
            incognito = current.incognito;
            url = current.url;
            var types = ['cookies', 'images', 'javascript', 'location', 'plugins',
                'popups', 'notifications', 'fullscreen', 'mouselock',
                'microphone', 'camera', 'unsandboxedPlugins',
                'automaticDownloads'];
            types.forEach(function (type) {
                // HACK: [type] is not recognised by the docserver's sample crawler, so
                // mention an explicit
                // type: chrome.contentSettings.cookies.get - See http://crbug.com/299634
                chrome.contentSettings[type] && chrome.contentSettings[type].get({
                    'primaryUrl': url,
                    'incognito': incognito
                },
                    function (details) {
                        var input = <HTMLInputElement>document.getElementById(type);
                        input.disabled = false;
                        input.value = details.setting;
                    });
            });
        });

        var selects = document.querySelectorAll('select');
        for (var i = 0; i < selects.length; i++) {
            selects[i].addEventListener('change', settingChanged);
        }
    });
}

// https://developer.chrome.com/extensions/runtime#method-openOptionsPage
function testOptionsPage() {
    chrome.runtime.openOptionsPage();
    chrome.runtime.openOptionsPage(function () {
        // Do a thing ...
    });
}

// https://developer.chrome.com/extensions/storage#type-StorageArea
function testStorage() {
    function getCallback(loadedData: { [key: string]: any; }) {
        var myValue: { x: number } = loadedData["myKey"];
    }

    chrome.storage.sync.get(getCallback);
    chrome.storage.sync.get("myKey", getCallback);
    chrome.storage.sync.get(["myKey", "myKey2"], getCallback);
    chrome.storage.sync.get({ foo: 1, bar: 2 }, getCallback);
    chrome.storage.sync.get(null, getCallback);

    function getBytesInUseCallback(bytesInUse: number) {
        console.log(bytesInUse);
    }

    chrome.storage.sync.getBytesInUse(getBytesInUseCallback);
    chrome.storage.sync.getBytesInUse("myKey", getBytesInUseCallback);
    chrome.storage.sync.getBytesInUse(["myKey", "myKey2"], getBytesInUseCallback);
    chrome.storage.sync.getBytesInUse(null, getBytesInUseCallback);

    function doneCallback() {
        console.log("done");
    }

    chrome.storage.sync.set({ foo: 1, bar: 2 });
    chrome.storage.sync.set({ foo: 1, bar: 2 }, doneCallback);

    chrome.storage.sync.remove("myKey");
    chrome.storage.sync.remove("myKey", doneCallback);
    chrome.storage.sync.remove(["myKey", "myKey2"]);
    chrome.storage.sync.remove(["myKey", "myKey2"], doneCallback);

    chrome.storage.sync.clear();
    chrome.storage.sync.clear(doneCallback);

    chrome.storage.onChanged.addListener(function (changes) {
        var myNewValue: { x: number } = changes["myKey"].newValue;
        var myOldValue: { x: number } = changes["myKey"].oldValue;
    });
}

function test_chrome_accessibilityFeatures() {

    var test_accessibilityFeatures_setting = function (setting: chrome.accessibilityFeatures.AccessibilityFeaturesSetting) {
        var accessibilityFeatures_get_callback = function (details: chrome.accessibilityFeatures.AccessibilityFeaturesCallbackArg) {
            var value = details.value;
            var levelOfControl = details.levelOfControl;
            if (levelOfControl === "not_controllable") {
                var levelOfControl_is_not_controllable = true;
            } else if (levelOfControl === "controlled_by_other_extensions") {
                var levelOfControl_is_controlled_by_other_extensions = true;
            } else if (levelOfControl === "controllable_by_this_extension") {
                var levelOfControl_is_controllable_by_this_extension = true;
            } else if (levelOfControl === "controlled_by_this_extension") {
                var levelOfControl_is_controlled_by_this_extension = true;
            }
            if ("incognitoSpecific" in details) {
                var incognitoSpecific = details.incognitoSpecific;
            }
        };

        setting.get({}, accessibilityFeatures_get_callback);
        setting.get({ incognito: false }, accessibilityFeatures_get_callback);

        setting.set({ value: "some_string_value" });
        setting.set({ value: "some_string_value", scope: "regular" });
        setting.set({ value: "some_string_value", scope: "regular_only" });
        setting.set({ value: "some_string_value", scope: "incognito_persistent" });
        setting.set({ value: "some_string_value", scope: "incognito_session_only" });
        setting.set({ value: "some_string_value" }, function () { });
        setting.set({ value: "some_string_value", scope: "regular" }, function () { });
        setting.set({ value: "some_string_value", scope: "regular_only" }, function () { });
        setting.set({ value: "some_string_value", scope: "incognito_persistent" }, function () { });
        setting.set({ value: "some_string_value", scope: "incognito_session_only" }, function () { });

        setting.set({ value: 42 });
        setting.set({ value: 42, scope: "regular" });
        setting.set({ value: 42, scope: "regular_only" });
        setting.set({ value: 42, scope: "incognito_persistent" });
        setting.set({ value: 42, scope: "incognito_session_only" });
        setting.set({ value: 42 }, function () { });
        setting.set({ value: 42, scope: "regular" }, function () { });
        setting.set({ value: 42, scope: "regular_only" }, function () { });
        setting.set({ value: 42, scope: "incognito_persistent" }, function () { });
        setting.set({ value: 42, scope: "incognito_session_only" }, function () { });

        setting.clear({});
        setting.clear({ scope: "regular" });
        setting.clear({ scope: "regular_only" });
        setting.clear({ scope: "incognito_persistent" });
        setting.clear({ scope: "incognito_session_only" });
        setting.clear({}, function () { });
        setting.clear({ scope: "regular" }, function () { });
        setting.clear({ scope: "regular_only" }, function () { });
        setting.clear({ scope: "incognito_persistent" }, function () { });
        setting.clear({ scope: "incognito_session_only" }, function () { });
    }

    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.spokenFeedback);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.largeCursor);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.stickyKeys);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.highContrast);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.screenMagnifier);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.autoclick);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.virtualKeyboard);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.caretHighlight);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.cursorHighlight);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.focusHighlight);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.selectToSpeak);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.switchAccess);
    test_accessibilityFeatures_setting(chrome.accessibilityFeatures.animationPolicy);
}

function test_chrome_alarms() {
    const testAlarmName = "testAlarm";

    function alarm_detail_callback(alarm: chrome.alarms.Alarm) {
        var name = alarm.name;
        if ("periodInMinutes" in alarm) {
            var periodInMinutes = alarm.periodInMinutes;
        }
        var scheduledTime = alarm.scheduledTime;
    };
    function alarm_cleared_callback(was_cleared: boolean) { };

    chrome.alarms.onAlarm.addListener(alarm_detail_callback);

    chrome.alarms.create(testAlarmName);
    chrome.alarms.create(testAlarmName, { when: Date.now() + 42 });
    chrome.alarms.create(testAlarmName, { when: Date.now() + 42, periodInMinutes: 42.42 });
    chrome.alarms.create(testAlarmName, { delayInMinutes: 42.42 });
    chrome.alarms.create(testAlarmName, { delayInMinutes: 42.42, periodInMinutes: 42.42 });

    chrome.alarms.get(alarm_detail_callback);
    chrome.alarms.get(testAlarmName, alarm_detail_callback);

    chrome.alarms.getAll(function (alarms) { alarms.forEach(alarm_detail_callback); });

    chrome.alarms.clear();
    chrome.alarms.clear(alarm_cleared_callback);

    chrome.alarms.clear(testAlarmName);
    chrome.alarms.clear(testAlarmName, alarm_cleared_callback);

    chrome.alarms.clearAll();
    chrome.alarms.clearAll(alarm_cleared_callback);
}

function test_chrome_bookmarks() {
    function bookmark_tree_node_callback(bookmark: chrome.bookmarks.BookmarkTreeNode) {
        var id = bookmark.id;
        if ("parentId" in bookmark) {
            var parentId = bookmark.parentId;
        }
        if ("indedx" in bookmark) {
            var index = bookmark.index;
        }
        if ("url" in bookmark) {
            var url = bookmark.url;
        }
        var title = bookmark.title;
        if ("dateAdded" in bookmark && bookmark.dateAdded) {
            var dateAdded = new Date(bookmark.dateAdded);
        }
        if ("dateGroupModified" in bookmark) {
            var dateGroupModified = bookmark.dateGroupModified;
        }
        if ("unmodifiable" in bookmark) {
            var unmodifiable = bookmark.unmodifiable;
            if (unmodifiable === "managed") {
                var unmodifiable_is_managed = true;
            }
        }
        if (typeof bookmark.children !== "undefined" && bookmark.children) {
            bookmark.children.forEach(bookmark_tree_node_callback);
        }
    }

    function bookmark_tree_node_array_callback(bookmarks: chrome.bookmarks.BookmarkTreeNode[]) {
        bookmarks.forEach(bookmark_tree_node_callback);
    }

    chrome.bookmarks.get("testBookmark", bookmark_tree_node_array_callback);
    chrome.bookmarks.get(["testBookmark1", "testBookmark2"], bookmark_tree_node_array_callback);

    chrome.bookmarks.getChildren("testBookmark", bookmark_tree_node_array_callback);

    chrome.bookmarks.getRecent(42, bookmark_tree_node_array_callback);

    chrome.bookmarks.getTree(bookmark_tree_node_array_callback);

    chrome.bookmarks.getSubTree("testBookmark", bookmark_tree_node_array_callback);

    chrome.bookmarks.search("Test", bookmark_tree_node_array_callback);
    chrome.bookmarks.search("Test Title", bookmark_tree_node_array_callback);
    chrome.bookmarks.search("http://www.example.com/test_url", bookmark_tree_node_array_callback);

    chrome.bookmarks.search({ query: "Test" }, bookmark_tree_node_array_callback);
    chrome.bookmarks.search({ query: "Test", title: "Test Title" }, bookmark_tree_node_array_callback);
    chrome.bookmarks.search({ query: "Test", url: "http://www.example.com/test_url" }, bookmark_tree_node_array_callback);
    chrome.bookmarks.search({ query: "Test", title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_array_callback);
    chrome.bookmarks.search({ title: "Test Title" }, bookmark_tree_node_array_callback);
    chrome.bookmarks.search({ title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_array_callback);
    chrome.bookmarks.search({ url: "http://www.example.com/test_url" }, bookmark_tree_node_array_callback);

    chrome.bookmarks.create({ parentId: "testBookmarkParent" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42 });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42, title: "Test Title" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42, title: "Test Title", url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42, url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", title: "Test Title" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", title: "Test Title", url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent", url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ index: 42 });
    chrome.bookmarks.create({ index: 42, title: "Test Title" });
    chrome.bookmarks.create({ index: 42, title: "Test Title", url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ index: 42, url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ title: "Test Title" });
    chrome.bookmarks.create({ title: "Test Title", url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ url: "http://www.example.com/test_url" });
    chrome.bookmarks.create({ parentId: "testBookmarkParent" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42 }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42, title: "Test Title" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42, title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", index: 42, url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", title: "Test Title" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ parentId: "testBookmarkParent", url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ index: 42 }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ index: 42, title: "Test Title" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ index: 42, title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ index: 42, url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ title: "Test Title" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.create({ url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);

    chrome.bookmarks.move("testBookmark", { parentId: "testBookmarkDestination" });
    chrome.bookmarks.move("testBookmark", { index: 42 });
    chrome.bookmarks.move("testBookmark", { parentId: "testBookmarkDestination" }, bookmark_tree_node_callback);
    chrome.bookmarks.move("testBookmark", { index: 42 }, bookmark_tree_node_callback);

    chrome.bookmarks.update("testBookmark", { title: "Test Title" });
    chrome.bookmarks.update("testBookmark", { title: "Test Title", url: "http://www.example.com/test_url" });
    chrome.bookmarks.update("testBookmark", { url: "http://www.example.com/test_url" });
    chrome.bookmarks.update("testBookmark", { title: "Test Title" }, bookmark_tree_node_callback);
    chrome.bookmarks.update("testBookmark", { title: "Test Title", url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);
    chrome.bookmarks.update("testBookmark", { url: "http://www.example.com/test_url" }, bookmark_tree_node_callback);

    chrome.bookmarks.remove("testBookmark");
    chrome.bookmarks.remove("testBookmark", function () { });

    chrome.bookmarks.removeTree("testBookmark");
    chrome.bookmarks.removeTree("testBookmark", function () { });

    function bookmark_id_and_tree_node_callback(id: string, bookmark: chrome.bookmarks.BookmarkTreeNode) {
        bookmark_tree_node_callback(bookmark);
    }

    chrome.bookmarks.onCreated.addListener(bookmark_id_and_tree_node_callback);

    function bookmark_id_and_remove_info_callback(id: string, removeInfo: chrome.bookmarks.BookmarkRemoveInfo) {
        var parentId = removeInfo.parentId;
        var index = removeInfo.index;
        var node = removeInfo.node;
        bookmark_tree_node_callback(node);
    }

    chrome.bookmarks.onRemoved.addListener(bookmark_id_and_remove_info_callback);

    function bookmark_id_and_change_info_callback(id: string, changeInfo: chrome.bookmarks.BookmarkChangeInfo) {
        var title = changeInfo.title;
        if ("url" in changeInfo) {
            var url = changeInfo.url;
        }
    }

    chrome.bookmarks.onChanged.addListener(bookmark_id_and_change_info_callback);

    function bookmark_id_and_move_info_callback(id: string, moveInfo: chrome.bookmarks.BookmarkMoveInfo) {
        var parentId = moveInfo.parentId;
        var index = moveInfo.index;
        var oldParentId = moveInfo.oldParentId;
        var oldIndex = moveInfo.oldIndex;
    }

    chrome.bookmarks.onMoved.addListener(bookmark_id_and_move_info_callback);

    function bookmark_id_and_reorder_info_callback(id: string, reorderInfo: chrome.bookmarks.BookmarkReorderInfo) {
        var childIds = reorderInfo.childIds;
    }

    chrome.bookmarks.onImportBegan.addListener(function () { });
    chrome.bookmarks.onImportEnded.addListener(function () { });
}

function test_chrome_browserAction() {
    chrome.browserAction.setTitle({ title: "Test Title" });
    chrome.browserAction.setTitle({ title: "Test Title", tabId: 42 });

    chrome.browserAction.getTitle({}, function (title) { });
    chrome.browserAction.getTitle({ tabId: 42 }, function (title) { });

    chrome.browserAction.setIcon({});
    chrome.browserAction.setIcon({ imageData: "test" });
    chrome.browserAction.setIcon({ imageData: "test", tabId: 42 });
    chrome.browserAction.setIcon({ imageData: { "16": "test" } });
    chrome.browserAction.setIcon({ imageData: { "16": "test" }, tabId: 42 });
    chrome.browserAction.setIcon({ imageData: new ImageData(42, 42) });
    chrome.browserAction.setIcon({ imageData: new ImageData(42, 42), tabId: 42 });
    chrome.browserAction.setIcon({ path: "test" });
    chrome.browserAction.setIcon({ path: { "16": "test" } });
    chrome.browserAction.setIcon({ path: "test", tabId: 42 });
    chrome.browserAction.setIcon({ path: { "16": "test" }, tabId: 42 });
    chrome.browserAction.setIcon({ tabId: 42 });
    chrome.browserAction.setIcon({}, function () { });
    chrome.browserAction.setIcon({ imageData: "test" }, function () { });
    chrome.browserAction.setIcon({ imageData: "test", tabId: 42 }, function () { });
    chrome.browserAction.setIcon({ imageData: { "16": "test" } }, function () { });
    chrome.browserAction.setIcon({ imageData: { "16": "test" }, tabId: 42 }, function () { });
    chrome.browserAction.setIcon({ imageData: new ImageData(42, 42) }, function () { });
    chrome.browserAction.setIcon({ imageData: new ImageData(42, 42), tabId: 42 }, function () { });
    chrome.browserAction.setIcon({ path: "test" }, function () { });
    chrome.browserAction.setIcon({ path: { "16": "test" } }, function () { });
    chrome.browserAction.setIcon({ path: "test", tabId: 42 }, function () { });
    chrome.browserAction.setIcon({ path: { "16": "test" }, tabId: 42 }, function () { });
    chrome.browserAction.setIcon({ tabId: 42 }, function () { });

    chrome.browserAction.setPopup({ popup: "" });
    chrome.browserAction.setPopup({ popup: "Test Popup" });
    chrome.browserAction.setPopup({ popup: "Test Popup", tabId: 42 });

    chrome.browserAction.getPopup({}, function (popup) { });
    chrome.browserAction.getPopup({ tabId: 42 }, function (popup) { });

    chrome.browserAction.setBadgeText({ text: "Test Badge" });
    chrome.browserAction.setBadgeText({ text: "Test Badge", tabId: 42 });

    chrome.browserAction.getBadgeText({}, function (badgeText) { });
    chrome.browserAction.getBadgeText({ tabId: 42 }, function (badgeText) { });

    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255], tabId: 42 });
    chrome.browserAction.setBadgeBackgroundColor({ color: "red" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "red", tabId: 42 });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000", tabId: 42 });

    chrome.browserAction.getBadgeBackgroundColor({}, function (color) { });
    chrome.browserAction.getBadgeBackgroundColor({ tabId: 42 }, function (color) { });

    chrome.browserAction.enable();
    chrome.browserAction.enable(42);

    chrome.browserAction.disable();
    chrome.browserAction.disable(42);

    chrome.browserAction.onClicked.addListener(function (tab) { /* Test to test tabs.Tab instances in test_chrome_tabs */ });
}