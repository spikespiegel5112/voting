<template>
  <el-row>
    <CommonQuery>
      <template slot="button1">
        <el-button
          @click="handleCreate"
          icon="el-icon-plus"
          size="mini"
          type="primary"
          v-waves
        >
          添加投票
        </el-button>
        <el-button
          @click="handleMultipleDelete"
          icon="el-icon-delete"
          size="mini"
          type="danger"
          v-waves
        >
          批量删除
        </el-button>
      </template>
      <template slot="quicksearch">
        <div @keyup.enter="search" class="common_search_wrapper">
          <label>
            <input
              placeholder="请输入游戏名称"
              type="text"
              v-model="queryModel.brandName"
            />
          </label>
          <a>
            <span @click="search" class="el-icon-search"></span>
          </a>
        </div>
      </template>
    </CommonQuery>
    <el-table
      :data="tableList"
      :height="tableHeight"
      @selection-change="handleSelectionChange"
      border
      element-loading-text="Loading"
      fit
      highlight-current-row
      v-loading.body="listLoading"
    >
      <el-table-column
        fixed="left"
        type="selection"
        width="30"
      ></el-table-column>
      <el-table-column
        align="center"
        fixed
        label="No"
        type="index"
        width="45"
      ></el-table-column>
      <el-table-column
        align="center"
        label="投票名称"
        prop="votingName"
      ></el-table-column>
      <el-table-column
        align="center"
        label="是否多选"
        prop="isMultiple"
      ></el-table-column>

      <el-table-column align="center" fixed="right" label="操作" width="70px">
        <template slot-scope="scope">
          <el-button @click="handleDelete(scope)" size="mini" type="danger"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="common_pagination_wrapper">
      <el-pagination
        :current-page.sync="pagination.page"
        :page-size="pagination.limit"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        background
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </div>
    <!-- 编辑 -->
    <!-- 123 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="editDialogFlag"
      top="10vh"
    >
      <el-form
        ref="formData"
        :model="formData"
        :rules="rules"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="投票名称">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="是否多选">
          <el-switch
            v-model="formData.isMultiple"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
        </el-form-item>
      </el-form>
      <div class="footer alginright">
        <el-button type="primary" @click="submitCreate">保存</el-button>
        <el-button @click="editDialogFlag = false">取消</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      getListByPaginationRequest: 'voting/getListByPagination',
      createOrUpdateRequest: 'voting/createOrUpdate',

      crawlerSettingFlag: false,
      crawlerSetting: {
        address: ''
      },
      editDialogFlag: false,
      chosenReward: '',
      chooseRewardTypeModel: {},
      chosenThirdPartyProductInfo: {},

      value2: '',
      value1: '',
      dailyLimitMode: '',
      limitMode: '',
      tableKey: 0,

      tableList: [],
      total: null,
      listLoading: true,
      availabilityFlag: false,

      queryModel: {
        sort: 'desc',
        brandName: ''
      },
      pagination: {
        page: 1,
        limit: 100
      },
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      formData: {
        rewardType: '',
        crawlerAddress: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      formData: {
        name: '',
        isMultiple: false
      },
      rules: {
        name: [{ required: true, message: '此项为必填项', trigger: 'change' }],
        isMultiple: [
          { required: true, message: '此项为必填项', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    tableHeight() {
      return this.$store.state.app.tableHeight;
    },
    dictionaryList() {
      return this.$store.state.app.dictionary.crawlerAddress;
    }
  },
  watch: {
    effectiveDuration(value) {
      console.log(value);
      if (value === null) {
        value = [];
      }
      this.formData.startDate = this.$moment(value[0]).format('YYYY-MM-DD');
      this.formData.endDate = this.$moment(value[1]).format('YYYY-MM-DD');
    },
    currentAdvertisementTabIndex(value) {
      console.log(value);
    }
  },
  async mounted() {
    // this.settingsList = await this.getSettingsDictionary()
    this.getTableData();
  },
  methods: {
    getTableData() {
      this.listLoading = true;
      this.queryModel = Object.assign(this.queryModel, this.pagination);
      this.$http
        .get(this.$baseUrl + this.getListByPaginationRequest, {
          params: this.queryModel
        })
        .then(response => {
          console.log('getListByPaginationRequest', response);
          this.tableList = response.data;
          this.total = response.pagination.total;
          this.listLoading = false;
        });
    },
    getSettingsDictionary() {
      return new Promise((resolve, reject) => {
        this.$http
          .get(this.$baseUrl + this.getSettingsRequest, {
            params: {
              type: 'crawlerAddress'
            }
          })
          .then(response => {
            resolve(response.data);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      });
    },
    handleFilter() {
      this.pagination.page = 1;
      this.getTableData();
    },
    handleSizeChange(val) {
      this.pagination.limit = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.pagination.page = val;
      this.getTableData();
    },
    resetTemp() {
      this.formData = {
        id: '',
        description: '',
        rewardImage: '',
        rewardName: '',
        rewardPrompt: '',
        rewardStr: '',
        rewardType: '',
        rewardValue: '',
        status: '.....'
      };
    },
    crawlerData() {
      this.$http
        .post(this.$baseUrl + this.crawlAndSaveRequest, {
          address: this.formData.crawlerAddress,
          headerCode: this.formData.headerCode
        })
        .then(response => {
          console.log(response);
          this.$message.success('抓取成功');

          this.getTableData();
          this.oneKeyCrawlFlag = false;
        });
    },
    createData() {
      this.formData.id = '';
      this.updateData();
    },
    handleUpdate(scope) {
      console.log(scope);
      this.formData = Object.assign({}, scope.row);

      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['formData'].clearValidate();
      });
    },
    updateData() {
      this.$refs['formData'].validate(valid => {
        if (valid) {
          this.$http
            .post(this.$baseUrl + this.addAndUpdateRewardInfoRequest, {
              id: this.formData.id,
              description: this.formData.description,
              rewardImage: this.formData.rewardImage,
              rewardName: this.formData.rewardName,
              rewardPrompt: this.formData.rewardPrompt,
              rewardStr: this.formData.rewardStr,
              rewardType: this.formData.rewardType,
              rewardValue: this.formData.rewardValue,
              status: this.formData.status
            })
            .then(response => {
              console.log(response);
              this.dialogFormVisible = false;
              this.$message.success('信息修改成功');
              this.getTableData();
            })
            .catch(error => {
              console.log(error);
              this.$message.error(
                `${error.response.status.toString()}  ${
                  error.response.data.error
                }`
              );
            });
        }
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(val);
    },
    handleMultipleDelete() {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          console.log('this.multipleSelection+++++', this.multipleSelection);
          this.deleteRecord(
            this.multipleSelection.map(item => {
              return {
                id: item.id,
                movieId: item.movieId,
                timestamp: item.timestamp
              };
            })
          );
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    handleDelete(scope) {
      console.log(scope);
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteRecord([scope.row.movieId]);
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    deleteRecord(data) {
      this.$http
        .delete(this.$baseUrl + this.deleteRecordRequest, {
          data: {
            selections: data
          }
        })
        .then(response => {
          console.log(response);
          this.dialogFormVisible = false;
          this.$message.success('删除成功');
          this.getTableData();
        })
        .catch(error => {
          console.log(error);
          this.$message.error(
            `${error.response.status.toString()}  ${error.response.data.error}`
          );
        });
    },

    expand() {
      this.expandQuery = !this.expandQuery;
    },
    search() {
      this.getTableData();
    },
    reset() {
      this.queryModel.available = true;
    },

    uploadSuccess1(response) {
      console.log(response);
      this.formData.icon = response.url;
    },
    uploadSuccess2(response) {
      this.formData.rewardImage = response.url;
    },
    changeDailyLimitMode(data) {
      this.formData.dailyLimit =
        data.toString() === 'unlimited' ? '-1' : this.formData.dailyLimit;
    },
    changeLimitMode(data) {
      this.formData.limit =
        data.toString() === 'unlimited' ? '-1' : this.formData.limit;
      alert(this.formData.limit);
    },
    chooseRewardType(data) {
      this.formData.type = this.settingsList.filter(
        item => item.value === data
      )[0].code;
      this.formData.crawlerAddress = data;
    },
    chooseThirdPartyProduct(data) {
      this.chosenThirdPartyProductInfo = data;
    },
    confirmCrawlerSetting() {
      this.crawlerSettingFlag = false;
      this.$message.success('设置成功');
    },

    focusSortList(queryString, callback) {
      this.loading = true;

      // this.queryModel = Object.assign(this.queryModel, {
      //   limit: 999,
      //   page: 1,
      //   status: 1,
      //   title: '',
      //   description: '',
      //   gameTypeId: '',
      // });
      // console.log(this.queryModel)

      this.$http
        .get(this.$baseUrl + this.queryRewardProductByNameRequest, {
          params: {
            name: this.chosenReward
          }
        })
        .then(response => {
          console.log(response);
          this.loading = false;
          // this.total = response.total;
          let result = [];
          if (response.data.length !== 0) {
            response.data.forEach((item, index) => {
              result.push(
                Object.assign(item, {
                  value: item.name
                })
              );
            });

            console.log(111, result);

            callback(result);
          }
        });
    },
    async getAllCrawlingIndex() {
      this.prepareToCrawlFlag = false;
      this.$http
        .get(this.$baseUrl + this.crawlMovieListRequest, {
          params: {
            address: 'https://piaofang.maoyan.com/store',
            headerCode: 'maoyanPreSale',
            limit: this.preSaleListCountLimit
          }
        })
        .then(response => {
          // this.preSaleListCountLimit =
          console.log(response);
          this.preSaleListCountLimit = response.data.length;

          this.preSaleListData = response.data;
          this.preSaleListData.forEach((item, index) => {
            if (index < this.preSaleListCountLimit) {
              this.$set(
                this.preSaleListData,
                index,
                Object.assign(item, {
                  detailSuccess: 0,
                  portraitSuccess: 0,
                  premiereSuccess: 0,
                  bookingDetailsSuccess: 0,
                  content: 'detailSuccess' + 'portraitSuccess',
                  color: 'sunccess',
                  recordTime: '---',
                  active: true
                })
              );
            }
          });
          this.$message.success('获取列表成功');
        })
        .catch(error => {
          this.$message.error(error);
        });
    },
    async beginToCrawPreSaleListMovieData() {
      this.crawlingCount = 0;
      this.preSaleData = [];
      this.preSaleListData.forEach((item, index) => {
        this.$set(
          this.preSaleListData,
          index,
          Object.assign(item, {
            detailSuccess: 0,
            portraitSuccess: 0,
            premiereSuccess: 0,
            bookingDetailsSuccess: 0
          })
        );
      });

      const preSaleData = this.preSaleListData.filter(item => item.active);
      // const preSaleListCountLimit
      let record = {};

      const timestamp = Date.now();

      const loop = () => {
        const crawlingCount = this.crawlingCount;
        this.crawlingFlag = true;
        const movieId = preSaleData[crawlingCount].movieId;
        const crawlPreSaleDetail = () => {
          return new Promise((resolve, reject) => {
            this.$http
              .get(this.$baseUrl + this.crawlPreSaleDetailRequest, {
                params: {
                  address: 'https://piaofang.maoyan.com/movie/' + movieId,
                  headerCode: 'maoyanPreSale'
                }
              })
              .then(response1 => {
                record.detail = response1.data;

                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    detailSuccess: 1
                  })
                );

                resolve(response1.data);
              })
              .catch(error => {
                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    detailSuccess: 2
                  })
                );
                reject(error);
              });
          });
        };

        const crawlPreSaleWantToSeePortrait = () => {
          return new Promise((resolve, reject) => {
            this.$http
              .get(this.$baseUrl + this.crawlPreSaleWantToSeePortraitRequest, {
                params: {
                  address: 'https://piaofang.maoyan.com/movie/' + movieId,
                  headerCode: 'maoyanPreSalePortrait'
                }
              })
              .then(response1 => {
                record.portrait = response1.data;

                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    portraitSuccess: 1,
                    color: 'success'
                  })
                );
                resolve(response1.data);
              })
              .catch(error => {
                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    portraitSuccess: 2,
                    color: 'failed'
                  })
                );

                reject(error);
              });
          });
        };

        const getPreSaleBoxOfficePremiere = () => {
          return new Promise((resolve, reject) => {
            this.$http
              .get(this.$baseUrl + this.crawlPreSaleBoxOfficePremiereRequest, {
                params: {
                  address:
                    'https://piaofang.maoyan.com/movie/' +
                    movieId +
                    '/premierebox',
                  headerCode: 'maoyanPreSalePortrait'
                }
              })
              .then(response1 => {
                record.portrait = response1.data;

                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    premiereSuccess: 1,
                    color: 'success'
                  })
                );
                resolve(response1.data);
              })
              .catch(error => {
                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    premiereSuccess: 2,
                    color: 'failed'
                  })
                );

                reject(error);
              });
          });
        };

        const crawlPreSaleBookingDetails = () => {
          return new Promise((resolve, reject) => {
            this.$http
              .get(this.$baseUrl + this.crawlPreSaleBookingDetailsRequest, {
                params: {
                  // address: 'https://piaofang.maoyan.com/movie/' + movieId + '/premierebox',
                  movieId: movieId,
                  headerCode: 'maoyanPreSalePortrait'
                }
              })
              .then(response1 => {
                record.portrait = response1.data;

                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    bookingDetailsSuccess: 1,
                    color: 'success'
                  })
                );
                resolve(response1.data);
              })
              .catch(error => {
                this.$set(
                  this.preSaleListData,
                  crawlingCount,
                  Object.assign(preSaleData[crawlingCount], {
                    bookingDetailsSuccess: 2,
                    color: 'failed'
                  })
                );

                reject(error);
              });
          });
        };

        const crawlPreSaleDetailPromise = crawlPreSaleDetail();
        const crawlPreSaleWantToSeePortraitPromise = crawlPreSaleWantToSeePortrait();
        const crawlPreSaleBoxOfficePremierePromise = getPreSaleBoxOfficePremiere();
        const crawlPreSaleBookingDetailsPromise = crawlPreSaleBookingDetails();

        Promise.all([
          crawlPreSaleDetailPromise,
          crawlPreSaleWantToSeePortraitPromise,
          crawlPreSaleBoxOfficePremierePromise,
          crawlPreSaleBookingDetailsPromise
        ])
          .then(responseAll => {
            console.log(responseAll);

            this.$set(
              this.preSaleData,
              crawlingCount,
              Object.assign(
                {
                  movieId: movieId,
                  timestamp: timestamp
                },
                responseAll[0],
                responseAll[1],
                responseAll[2]
              )
            );

            this.$set(this.bookingDetailsData, crawlingCount, {
              movieId: movieId,
              timestamp: timestamp,
              list: responseAll[3].map(item => {
                return Object.assign(item, {
                  timestamp: timestamp
                });
              })
            });

            this.crawlingCount++;
            if (this.crawlingCount === this.preSaleListCountLimit) {
              this.crawlingFlag = false;
            }
            console.log('preSaleData', this.preSaleData);

            if (this.crawlingFlag) {
              this.preSaleListData[crawlingCount].recordTime = this.$moment(
                Date.now()
              ).format('hh:mm:ss');
              loop();
            }
          })
          .catch(error => {
            console.log(error);
            if (this.crawlingCount === this.preSaleListCountLimit) {
              // debugger
              this.crawlingFlag = false;
            } else {
              this.crawlingCount++;
            }
            if (this.crawlingFlag) {
              loop();
            }
          });
      };

      loop();
    },
    stopCrawling() {
      this.crawlingFlag = false;
    },
    save() {
      if (this.crawlingCount === this.preSaleListCountLimit) {
        console.log('this.preSaleData+++++', this.preSaleData);
        const promise1 = this.$http.post(
          this.$baseUrl + this.saveMultipleMaoyanPreSaleRequest,
          this.preSaleData
        );
        const promise2 = this.$http.post(
          this.$baseUrl + this.saveMultipleMaoyanPreSaleBookingDetailsRequest,
          this.bookingDetailsData
        );

        Promise.all([promise1, promise2])
          .then(responseAll => {
            this.getTableData();
            this.editDialogFlag = false;
            this.$message.success('数据提交成功');
          })
          .catch(error => {
            this.$message.warning(error);
          });
      } else {
        // this.$message.warning('dsdsdsdsds')
      }
    },
    handleChangeLimitType(value) {
      console.log(this.crawlerCountType);
      if (this.crawlerCountType === 0) {
        this.preSaleListCountLimit = 0;
      }
    },
    handleChangeCountLimit() {},
    handleChangeCounter(value) {
      this.preSaleListData.forEach((item, index) => {
        this.$set(
          this.preSaleListData,
          index,
          Object.assign(this.preSaleListData[index], {
            active: index < this.preSaleListCountLimit
          })
        );
      });
      console.log('this.preSaleListData+++', this.preSaleListData);
    },
    handleCreate() {
      this.editDialogFlag = true;
      this.dialogStatus = 'create';
    },
    submitCreate() {
      this.$refs.formData
        .validate()
        .then(valid => {
          console.log(valid);
          this.$http
            .post(this.createOrUpdateRequest, this.formData)
            .then(response => {
              console.log(response);
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>
<style lang="scss"></style>
