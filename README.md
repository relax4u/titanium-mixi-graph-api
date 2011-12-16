# mixi Graph API for Titanium Mobile

Titanium Mobile用のmixi Graph APIモジュールです。

* APIを呼び出した際に、未認証の場合は自動的に認証画面が先に開きます。 (OFFにすることも可能です。
* 認証後のaccessTokenの再取得などは自動で行います。
* 一部のAPIはAndroidでは機能しません。
* 絵文字は未対応です。

## initialize

API群はクラスで提供しています。
consumerKeyやconsumerSecret、redirectUrlは、mixi developer で登録した内容を設定してください。
scopeの設定に関しては、mixi developer を参照にしてください。利用するAPIに応じて設定が必要です。

    var MixiGraphApi = require('mixi').GraphApi
    var api = new MixiGraphApi({
        consumerKey: "consumer_key",
        consumerSecret: "consumer_secret",
        redirectUrl: "http://example.com/success_callback",
        scope: ["r_profile"]
    });

## Authorize

認証するためには `MixiGraphApi#authorize()` を呼び出します。
未認証の場合はモーダルウインドウが開きます。認証済みの場合は何もおきません。
なお、認証済みの状態でscopeを変更した場合は、再認証されるようになっています。

    api.authorize();

認証を解除するためには `MixiGraphApi#logout()` を呼び出します。

    api.logout();

## API

### 共通仕様

mixi Graph API では、アクセスするURIに User-ID や Group-ID 等を含めなれけばなりません。
もちろん、このモジュールでも指定でき、指定する場合は、メソッドのプロパティにID名をキャメルケースに変換した名前で指定してください。
また、URIに含めるIDは mixi developer を参照してください。指定できるIDに関しては、デフォルトで本人を情報を返すようにIDを指定しています。

    api.people({
        userId: "@me",
        groupId: "@friends"
    });

mixi Graph API へリクエストが成功した場合、失敗した場合、それぞれに対してコールバックを指定することができます。
リクエストの戻り値は、コールバックでのみ取得することができます。

    api.people({
        success: function(json) {  // 成功時
            alert(json);
        },
        error: function(error) {   // 失敗時
            alert(error);
        }
    });

APIによってはパラメータを指定することもあります。その場合は`parameters`にパラメータを指定してください。
指定できるパラメータは mixi developer で確認してください。

    api.people({
        parameters: {
            fields: ["birthday", "displayName"]
            startIndex: 10,
            count: 10
        }
    });


### People API

* people({userId: "@me", groupId: "@self"})

### Groups API

* groups({userId: "@me"})

### People lookup API

* searchPeople({groupId: "@friends", parameters: {q: \["foo@example.com", "bar@example.com"\]}})

### Updates API

* updates({userId: "@me", groupId: "@self"})

### Voice API

* voiceStatusesUserTimeline()
* voiceStatusesFriendTimeline()
* voiceStatuses({postId: "postId"})
* voiceReplies({postId: "postId"})
* voiceFavorites({postId: "postId"})
* voiceStatusesUpdate({parameters: {status: "message", photo: Ti.Blob})
* voiceStatusesDestroy({postId: "postId"})
* voiceRepliesCreate({postId: "postId", parameters: {text: "comment"}})
* voiceRepliesDestroy({postId: "postId", commentId: "commentId"})
* voiceFavoritesCreate({postId: "postId")
* voiceFavoritesDestroy({postId: "postId", userId:"@me"})

### Check API

* share({key: "key", title: "title", primary_url: "http://example.com/"})

### Photo API

* photoAlbums()
* photoFriendAlbums()
* photoMediaItems({albumId: "albumId"})
* photoFriendMediaItems({albumId: "albumId"})
* photoAlbumComments({albumId: "albumId"})
* photoMediaItemComments({albumId: "albumId", mediaItemId: "mediaItemId"})
* photoMediaItemFavorites({albumId: "albumId", mediaItemId: "mediaItemId"})
* photoAlbumsCreate({parameters: {title: "album title", description: "album description", visibility: "self"}})
* photoAlbumsDestroy({albumId: "albumId"})
* photoAlbumCommentsCreate({albumId: "albumId", parameters: {text: "comment"}})
* photoAlbumCommentsDestroy({albumId: "albumId", commentId: "commentId")
* photoMediaItemsCreate({albumId: "albumId", parameters: {title: "photo title", image: Ti.Blob}}) ※iOSのみ
* photoMediaItemsDestroy({albumId: "alubmId", mediaItemId: "mediaItemId"})
* photoMediaItemCommentsCreate({albumId: "albumId", mediaItemId: "mediaItemId", parameters: {text: "comment"}})
* photoMediaItemCommentsDestroy({albumId: "albumId", mediaItemId: "mediaItemId", commentId: "commentId"})
* photoMediaItemFavoritesCreate({albumId: "albumId", mediaItemId: "mediaItemId"})
* photoMediaItemFavoritesDestroy({albumId: "albumId", mediaItemId: "mediaItemId", favoriteUserId: "favoriteUserId"})

### Message API

* messages({boxId: "@inbox"})
* messagesSend({title: "title", body: "body", recipients: ["userId"]})
* messagesUpdate({boxId: "@inbox", messageId: "messageId", parameters: {status: "read"}})
* messagesDestroy({messageId: "messageId"})

### Dialy API

* dialyCreate({parameters: {title: "title", body:"body", privacy: {visibility: "self"}}})  ※iOSのみ

`dialyCreate()`は、画像も投稿できますが、APIの仕様上jpegのみです。写真などはjpegに変換する必要があります。

    api.dialyCreate({
        parameters: {
            title: "title",
            body: "this is test",
            privacy: {
                visibility: "self",
                show_user: 0
            },
            images: [{Ti.Blob}, {Ti.Blob}, {Ti.Blob}]
        }
    });

### Check-in API

* spots()
* searchSpots()
* spot({spotId: "spotId"})
* spotsCreate({parameters: {name: "spot name", description: "my spot"})
* spotsDestroy({spotId: "spotId"})
* checkins()
* checkin({spotId: "spotId"})
* checkinsCreate({spotId: "spotId"})
* checkinsDestroy({spotID: "spotId", checkinId: "checkinId"})
* checkinComments({spotId: "spotId", checkinId: "checkinId"})
* checkinCommentsCreate({spotId: "spotId", checkinId: "checkinId", parameters: {text: "comment"}})
* checkinCommentsDestroy({spotId: "spotId", checkinId: "checkinId", commentId: "commentId"})
* checkinFavorites({spotId: "spotId", checkinId: "checkId"})
* checkinFavoritesCreate({spotId: "spotId", checkinId: "checkinId"})
* checkinFavoritesDestroy({spotId: "spotId", checkinId: "checkinId", favoriteUserId: "favoriteUserId"})

### Profile Image API

* peopleImages()
* peopleImagesCreate({parameters: {image: Ti.Blob, privacy: "everyone"}}) ※iOSのみ
* peopleImagesUpdate({imageId: "imageId", parameters: {primary: true, privacy: "everyone"}})
* peopleImagesDestroy({imageId: "imageId"})

### Other APIs

実装されていないAPIなどは、こちらを利用することで呼び出すことが可能です。

    api.callApi("GET", "hoge/@me/@self", {
        parameters: {foo: "bar"},
        success: function(json){
        },
        error: function(){
        }
    });


## for Android

Android版に適用する場合は、tiapp.xml に以下の記述を追加してください。追加しないと動かないと思います。

    <property name="ti.android.threadstacksize" type="int">51200</property>
