<?

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Aws\Credentials\CredentialProvider;

/**
 * helper for sending PDF to S3 bucket
 */
class AwsS3PdfSender
{
    /** @var S3Client $_client */
    protected $_client = null;

    /** @var string $_bucketName */
    protected $_bucketName = null;

    protected $_maxBucketCount = null;

    /**
     * AwsS3PdfSender constructor.
     * @throws Exception
     */
    public function __construct()
    {
        // Use the default credential provider
        $this->_client = new S3Client([
            'version' => 'latest',
            'region' => Yii::app()->params['awsRegion'],
            'credentials' => CredentialProvider::defaultProvider(),
        ]);
        if (!Yii::app()->params['maxBucketCount']) {
            throw new \Exception('MAX_BUCKET_COUNT can not be empty');
        }

        $this->_maxBucketCount = Yii::app()->params['maxBucketCount'];
    }

    /**
     * Create Bucket
     *
     * @param $bucketName
     * @return \Aws\Result|bool|string  BucketLocation or false
     * @throws Exception
     */
    public function createBucket($bucketName)
    {
        if (!is_string($bucketName) || $bucketName == '') {
            throw new \Exception('Bucket name can not be empty');
        }

        $this->_bucketName = $bucketName;
        if ($this->_client->doesBucketExist($this->_bucketName) == false) {
            try {
                return $this->_client->createBucket(['Bucket' => $this->_bucketName]);
            } catch (AwsException $e) {
                throw new \Exception('Bucket was not created. Error: ' . $e->getMessage());
            }
        }
        return false;
    }

    public function canCreateBucketWithNotifications($clientId)
    {
        $bucketsCount = $this->BucketsCount();
        if ($bucketsCount['bucketsCount'] + $bucketsCount['rpRecordsCount'] > $bucketsCount['MAX_BUCKETS_COUNT']) {
            $message = "User " . intval($clientId) . " tried to run RP. RP can not be implemented." .
                "The number of buckets on S3 can not exceed a limit in $bucketsCount[MAX_BUCKETS_COUNT] buckets.<br>" .
                "Used buckets: $bucketsCount[bucketsCount]<br>" .
                "RP in progress: $bucketsCount[rpRecordsCount]";
            CustomMail::sendHtmlMail(false, Yii::app()->config->get('SUPPORT_EMAIL'), "Remote Processing failed",
                $message);
            CustomMail::sendHtmlMail(false, Yii::app()->config->get('ADMIN_EMAIL'), "Remote Processing failed",
                $message);

            return false;
        }
        $freeBuckets = $bucketsCount['MAX_BUCKETS_COUNT'] - $bucketsCount['bucketsCount'] - $bucketsCount['rpRecordsCount'];
        if ($freeBuckets <= 10) {
            $message = "Buckets request service increase needed.<br>" .
                "There are only $freeBuckets free buckets of $bucketsCount[MAX_BUCKETS_COUNT].<br>" .
                "Used buckets: $bucketsCount[bucketsCount]<br>" .
                "RP in progress: $bucketsCount[rpRecordsCount]";
            CustomMail::sendHtmlMail(false, Yii::app()->config->get('SUPPORT_EMAIL'), "Warning! Buckets request service increase needed",
                $message);
            CustomMail::sendHtmlMail(false, Yii::app()->config->get('ADMIN_EMAIL'), "Warning! Buckets request service increase needed",
                $message);

        }
        return true;
    }

    public function BucketsCount()
    {
        $buckets = $this->_client->listBuckets([]);
        $bucketsCount = count($buckets['Buckets']);

        $rpRecords = RemoteProcessing::model()->findAll("(t.Export_Path is NULL OR t.Export_Path = '') AND t.Status_Proc < 100 AND t.Error <= 3");
        $rpRecordsCount = count($rpRecords);

        return [
            'bucketsCount' => $bucketsCount,
            'rpRecordsCount' => $rpRecordsCount,
            'MAX_BUCKETS_COUNT' => $this->_maxBucketCount,
        ];
    }

    protected function _uploadFile($content, $fileName)
    {
        $result = $this->_client->putObject(array(
            'Bucket' => $this->_bucketName,
            'Key' => $fileName,
            'Body' => $content
        ));

        if ($result['ObjectURL']) {
            return $fileName;
        }
        return false;
    }

    /**
     * Send Index Page PDF file
     */
    public function sendIndexPage($content, $companyName)
    {
        $indexName = 'Index_' . $companyName . '_' . date('Y-m-d-H-i-s') . '.pdf';

        return $this->_uploadFile($content, $indexName);
    }

    /**
     * Send any file
     *
     * @param $content
     * @param $type File Content Type
     * @param $imageId
     * @param $documentId
     * @param $clientId
     * @param $projectId
     * @return bool
     */
    public function sendFile($content, $type, $imageId, $documentId, $clientId, $projectId)
    {
        $fileName = self::generateFileName($imageId, $documentId, $clientId, $projectId);

        return $this->_uploadFile($content, $fileName . '.' . $type);
    }

    /**
     * Generate file name for upload file
     * @return string
     */
    public static function generateFileName($imageId, $documentId, $clientId, $projectId)
    {
        return $imageId . "-" . $documentId . "-" . $clientId . "-" . $projectId;
    }
}