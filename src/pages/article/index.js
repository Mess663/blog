import './index.less'

import $ from 'jquery'
import marked from 'marked';

$('article').html(marked($('.tem').text()))