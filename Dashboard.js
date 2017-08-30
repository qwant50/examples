'use strict';

function Dashboard(progressBar) {
    this.progressBar = progressBar;
    this.client_id = 'all';
    this.project_id = 'all';
    this.metrics = {};
}

Dashboard.prototype = {

    initCompanyProjectList : function () {
        var self = this;

        $('.client_project').click(function() {
            self.setClientProject($(this).data('client-id'), $(this).data('project-id'));

            self.setCaption($(this).html());
            self.updater([self.toApprove, self.toBatch, self.inApproval, self.toFile, self.w9Temp,
                self.dataentry, self.pettyCash, self.misc]);
        });

        $('.reload_icon_primary').click(function() {
            self.updater([self.toApprove, self.toBatch, self.inApproval, self.toFile, self.w9Temp,
                self.dataentry, self.pettyCash, self.misc]);
        });

        $('.client_name').click(function() {
            var clientId = $(this).data('client-id');
            var ul = $('#' + clientId);
            $('span.client_name').removeClass('bold_name');
            $(this).addClass('bold_name');

            if (ul.is(':visible')) {
                ul.slideUp(200);
            } else {
                ul.slideDown(200);

                self.setClientProject(clientId, 'all');

                self.setCaption($(this).html() + ' / All Projects');
                self.updater([self.toApprove, self.toBatch, self.inApproval, self.toFile, self.w9Temp,
                    self.dataentry, self.pettyCash, self.misc]);
            }
        });
    },

    /**
     * Shows `calculation` message while ajax queries are performing
     * @param objectsArr  array of objects
     */
    updater: function (objectsArr) {
        var self = this;
        var count = 0;
        var inProgress = true;
        var promisesArr = [];
        self.progressBar.setValue(0);
        $("#progress_bar_container").show();
        $("#progress_bar_container .canceltext").click(function (){
            inProgress = false;
            $('.calculating').hide();
            $(".canceltext").hide();
            self.progressBar.hide_progress();
            $("#progress_bar_container .canceltext").off();
        });

        $(".canceltext").show();
        $('.calculating').show();

        objectsArr.forEach(promiseficator);
        Promise.all(promisesArr).then(function () {
            console.log(inProgress);
            inProgress ? self.itemToProcessUpdate() : self.itemsClearAll();
            $('.calculating').hide();
            $(".canceltext").hide();
            self.progressBar.hide_progress();
            $("#progress_bar_container .canceltext").off();
        }, function () {
            self.itemsClearAll();
            $('.calculating').hide();
            $(".canceltext").hide();
            self.progressBar.hide_progress();
            $("#progress_bar_container .canceltext").off();
        });

        function promiseficator(object, index, array) {
            promisesArr.push(self.ajaxHandler(object.url).then(function(response)
            {
                count++;
                self.progressBar.setValue(count * 100 / objectsArr.length);
                inProgress ? object.setData.call(self, response) : object.clearData.call(self);
            }, function () {
                object.clearData.call(self);
            }));
        }
    },

    itemToProcessUpdate: function(){
        var self = this;
        var m = self.metrics;
        var overall = 0;
        for (var key in m) {
            overall += Number(m[key]);
        }
        $('.ip-overall').text(overall);
    },

    itemsClearAll: function(){
        var self = this;
        var emptySimbol = '-';
        self.metrics = {};

        $('.ip-overall').text(emptySimbol);
    },

    initDashboard: function (){
        var self = this;

        $('a', '.first-col, .second-col, .third-col').click(function (e) {
            e.preventDefault();
            if (isNaN(self.client_id)) {
                return;  // link is active only if company is selected.
            }
            window.location = this.href + (this.search ? '&' : '?') +
                'todo=changeclient&client=' + self.client_id + '&project=' + self.project_id;
        });

        <!-- init to-approve block  -->
        $('[data-action=to-approve]').click(function () {
            self.updater([self.toApprove]);
        });

        $('.to-approve').click(function (e) {
            e.stopPropagation();
            $('.to-approve-small').css({'display' : 'inline-flex'});
        });

        $('.to-approve-small').click(function (e) {
            e.stopPropagation();
        });

        $('body').click(function () {
            $('.to-approve-small').hide();
            $('.to-approve').css({'display' : 'inline-flex'});
        });

        <!-- init to-batch block  -->
        $('[data-action=to-batch]').click(function () {
            self.updater([self.toBatch]);
        });

        $('.to-batch').click(function (e) {
            e.stopPropagation();
            $('.to-batch-small').css({'display' : 'inline-flex'});
        });

        $('.to-batch-small').click(function (e) {
            e.stopPropagation();
        });

        $('body').click(function () {
            $('.to-batch-small').hide();
            $('.to-batch').css({'display' : 'inline-flex'});
        });

        <!-- init in-approval block  -->
        $('[data-action=in-approval]').click(function () {
            self.updater([self.inApproval]);
        });

        $('.in-approval').click(function (e) {
            e.stopPropagation();
            $('.in-approval-small').css({'display' : 'inline-flex'});
        });

        $('.in-approval-small').click(function (e) {
            e.stopPropagation();
        });

        $('body').click(function () {
            $('.in-approval-small').hide();
            $('.in-approval').css({'display' : 'inline-flex'});
        });

        <!-- init to-file block  -->
        $('[data-action=to-file]').click(function () {
            self.updater([self.toFile]);
        });
        $('.to-file').click(function (e) {
            e.stopPropagation();
            $('.to-file-small').css({'display' : 'inline-flex'});
        });
        $('.to-file-small').click(function (e) {
            e.stopPropagation();
        });
        $('body').click(function () {
            $('.to-file-small').hide();
            $('.to-file').css({'display' : 'inline-flex'});
        });

        <!-- init w9-temp block  -->
        $('[data-action=w9-temp]').click(function () {
            self.updater([self.w9Temp]);
        });

        <!-- init dataentry block  -->
        $('[data-action=dataentry]').click(function () {
            self.updater([self.dataentry]);
        });

        <!-- init petty cash block  -->
        $('[data-action=petty-cash]').click(function () {
            self.updater([self.pettyCash]);
        });

        <!-- init misc block  -->
        $('[data-action=misc]').click(function () {
            self.updater([self.misc]);
        });

        self.updater([self.toApprove, self.toBatch, self.inApproval, self.toFile, self.w9Temp,
            self.dataentry, self.pettyCash, self.misc]);
    },

    ajaxHandler: function (url) {
        var self = this;
        return $.ajax({
            url: url,
            type: "POST",
            data: {
                client_id: self.getClientId(),
                project_id: self.getProjectId()
            },
            dataType: "json"
        }).then(function (response) {
                if (!response || response.error) {
                    show_alert(response.error);
                    return $.Deferred().reject(response.error);
                }
                return $.Deferred().resolve(response);

            },
            function (jqXHR, exception) {
                ajaxErrorAlert(jqXHR, exception);
                return $.Deferred().reject(jqXHR, exception);
            });
    },

    toApprove: {
        url: '/site/GetToApprove',
        setData: function (response) {
            $('#to-approve-overall').text(Number(response.apsToApprove) + Number(response.posToApprove) +
                Number(response.pcsToApprove));
            $('#to-approve-ap').text('AP: ' + response.apsToApprove);
            $('#to-approve-po').text('PO: ' + response.posToApprove);
            $('#to-approve-pc').text('PC: ' + response.pcsToApprove);
            this.metrics.apsToApprove = response.apsToApprove;
            this.metrics.posToApprove = response.posToApprove;
            this.metrics.pcsToApprove = response.pcsToApprove;
        },

        clearData: function () {
            $('#to-approve-overall').text('-');
            $('#to-approve-ap').text('AP: ' + '-');
            $('#to-approve-po').text('PO: ' + '-');
            $('#to-approve-pc').text('PC: ' + '-');
            this.metrics.apsToApprove = 0;
            this.metrics.posToApprove = 0;
            this.metrics.pcsToApprove = 0;
        }
    },

    toBatch: {
        url: '/site/GetToBatch',
        setData: function (response) {
            $('#to-batch-overall').text(Number(response.ap) + Number(response.po) + Number(response.pc));
            $('#to-batch-ap').text('AP: ' + response.ap);
            $('#to-batch-po').text('PO: ' + response.po);
            $('#to-batch-pc').text('PC: ' + response.pc);
            this.metrics.apsToBatch = response.ap;
            this.metrics.posToBatch = response.po;
            this.metrics.pcsToBatch = response.pc;
        },

        clearData: function (){
            $('#to-batch-overall').text('-');
            $('#to-batch-ap').text('AP: ' + '-');
            $('#to-batch-po').text('PO: ' + '-');
            $('#to-batch-pc').text('PC: ' + '-');
            this.metrics.apsToBatch = 0;
            this.metrics.posToBatch = 0;
            this.metrics.pcsToBatch = 0;
        }
    },

    inApproval: {
        url: '/site/GetInApproval',
       setData: function (response) {
            $('#in-approval-overall').text(Number(response.ap) + Number(response.po) + Number(response.pc));
            $('#in-approval-ap').text('AP: ' + response.ap);
            $('#in-approval-po').text('PO: ' + response.po);
            $('#in-approval-pc').text('PC: ' + response.pc);
        },

        clearData: function (){
            $('#in-approval-overall').text('-');
            $('#in-approval-ap').text('AP: ' + '-');
            $('#in-approval-po').text('PO: ' + '-');
            $('#in-approval-pc').text('PC: ' + '-');
        }
    },

    toFile: {
        url: '/site/GetToFile',
        setData: function (response) {
            $('#to-file').text(Number(response.toFileLb) + Number(response.toFileGf));
            $('#to-file-lb').text('LB: ' + response.toFileLb);
            $('#to-file-gf').text('GF: ' + response.toFileGf);

            this.metrics.toFileLb = response.toFileLb;
            this.metrics.toFileGf = response.toFileGf;
        },

        clearData: function (){
            $('#to-file').text('-');
            $('#to-file-lb').text('LB: ' + '-');
            $('#to-file-gf').text('GF: ' + '-');

            this.metrics.toFileLb = 0;
            this.metrics.toFileGf = 0;
        }
    },

    w9Temp: {
        url: '/site/GetW9Temp',
        setData: function(response){
            $('#w9-temp').text(Number(response.w9Temp));
        },

        clearData: function () {
            $('#w9-temp').text('-');
        }
    },

    dataentry: {
        url: '/site/GetDataentry',
        setData: function (response) {
            $('#dataentry-ap .value').text(Number(response.apsToEntry));
            $('#dataentry-po .value').text(Number(response.posToEntry));
            $('#dataentry-w9 .value').text(Number(response.w9ToEntry));
            $('#dataentry-pm .value').text(Number(response.pmToEntry));
            $('#dataentry-pc .value').text(Number(response.pcToEntry));
            $('#dataentry-je .value').text(Number(response.jeToEntry));
            $('#dataentry-other .value').text(Number(response.prToEntry) + Number(response.arToEntry));

            $('.de-overall').text(response.total);

            this.metrics.apsToEntry = response.apsToEntry;
            this.metrics.posToEntry = response.posToEntry;
            this.metrics.w9ToEntry = response.w9ToEntry;
            this.metrics.pmToEntry = response.pmToEntry;
            this.metrics.pcToEntry = response.pcToEntry;
            this.metrics.jeToEntry = response.jeToEntry;
            this.metrics.prToEntry = response.prToEntry;
            this.metrics.arToEntry = response.arToEntry;
        },

        clearData: function(){
            $('#dataentry-ap .value').text('-');
            $('#dataentry-po .value').text('-');
            $('#dataentry-w9 .value').text('-');
            $('#dataentry-pm .value').text('-');
            $('#dataentry-pc .value').text('-');
            $('#dataentry-je .value').text('-');
            $('#dataentry-other .value').text('-');

            $('.de-overall').text('-');

            this.metrics.apsToEntry = 0;
            this.metrics.posToEntry = 0;
            this.metrics.w9ToEntry = 0;
            this.metrics.pmToEntry = 0;
            this.metrics.pcToEntry = 0;
            this.metrics.jeToEntry = 0;
            this.metrics.prToEntry = 0;
            this.metrics.arToEntry = 0;
        }
    },

    pettyCash: {
        url: '/site/GetPettyCash',
        setData: function (response) {
            $('#pc-to-audit .value').text(Number(response.pcToAudit));
            $('#pc-to-payout .value').text(Number(response.pcToPayout));
            $('#pc-to-pickup .value').text(Number(response.pcToPickup));

            $('.pc-overall').text(Number(response.pcToAudit) + Number(response.pcToPayout) + Number(response.pcToPickup));

            this.metrics.pcToAudit = response.pcToAudit;
            this.metrics.pcToPayout = response.pcToPayout;
            this.metrics.pcToPickup = response.pcToPickup;
        },

        clearData: function () {
            $('#pc-to-audit .value').text('-');
            $('#pc-to-payout .value').text('-');
            $('#pc-to-pickup .value').text('-');

            $('.pc-overall').text('-');

            this.metrics.pcToAudit = 0;
            this.metrics.pcToPayout = 0;
            this.metrics.pcToPickup = 0;
        }
    },

    misc: {
        url: '/site/getMisc',
        setData: function (response) {
            $('#misc-erp-upload .value').text(Number(response.erpUpload));
            $('#misc-erp-post .value').text(Number(response.erpPost));
            $('#misc-w9-reimb .value').text(Number(response.w9Reimb));
            $('#misc-w9-intl .value').text(Number(response.w9Intl));
            $('#misc-w9-notverified .value').text(Number(response.w9NotVerified));

            $('.mi-overall').text(Number(response.erpUpload) + Number(response.erpPost) + Number(response.w9Reimb) +
                Number(response.w9Intl) + Number(response.w9NotVerified));
        },
        clearData: function () {
            $('#misc-erp-upload .value').text('-');
            $('#misc-erp-post .value').text('-');
            $('#misc-w9-reimb .value').text('-');
            $('#misc-w9-intl .value').text('-');
            $('#misc-w9-notverified .value').text('-');

            $('.mi-overall').text('-');
        }
    },

    setCaption: function (caption) {
        $('.big_numbers').html(caption);
    },

    setClientProject: function (clientId, projectId) {
        this.client_id = clientId;
        this.project_id = projectId;
    },

    getClientId: function () {
        return this.client_id;
    },

    getProjectId: function () {
        return this.project_id;
    }

};