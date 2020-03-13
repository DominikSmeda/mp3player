
class Net {
    constructor() {

    }

    init() {
        return this.sendData('/');
    }

    sendData(url, data = { a: 'BRAK' }) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'POST',
                data: data
            })
                .done(data => {
                    //   console.log(data);
                    if (data) {
                        resolve(JSON.parse(data));
                    }
                    else {
                        resolve();
                    }
                })
                .fail(err => {
                    //   console.log(err);

                    reject(err)
                })
        })

    }
}
