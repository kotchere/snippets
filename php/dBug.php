<?php
/**
 * dBug Classx
 * =============
 * Dumps/Displays the contents of a variable in a colored tabular format
 * Based on the idea, javascript and css code of Macromedia's ColdFusion cfdump tag
 * A much better presentation of a variable's contents than PHP's var_dump and print_r functions
 *
 *
 * USAGE
 * =============
 * new dBug (variable [,force_type]);
 * example:
 * new dBug ($myVariable);
 *
 * 
 * if the optional "force_type" string is given, the variable supplied to the 
 * function is forced to have that force_type type. 
 * example: new dBug( $myVariable , "array" );
 * will force $myVariable to be treated and dumped as an array type, 
 * even though it might originally have been a string type, etc.
 *
 *
 * NOTE!
 * ==============
 * force_type is REQUIRED for dumping an xml string or xml file
 * new dBug ( $strXml, "xml" );
 *
 *
 * ADDITIONAL NOTES
 * ============= 
 * All the credit goes to ColdFusion's brilliant cfdump tag
 * Hope the next version of PHP can implement this or have something similar
 * I love PHP, but var_dump BLOWS!!!
 *
 * FOR DOCUMENTATION AND EXAMPLES: http://dbug.ospinto.com
 *
 * Kwaku Otchere 
 * ospinto@hotmail.com
 * 
 * Thanks to Andrew Hewitt (rudebwoy@hotmail.com) for the idea and suggestion
 *
 *
 * @author Kwaku Otchere <ospinto@gmail.com>
 * @misc Special thanks to Andrew Hewitt for idea and suggestion
 */


class dBug {
  
  private $xml_c_data;
  private $xml_s_data;
  private $xml_d_data;
  private $xml_count = 0;
  private $xml_attrib;
  private $xml_name;

  /**
   * Possible variable types
   * @var array
   * @access private
   */
  private $a_type = array("array", "object", "resource", "boolean", "NULL");
  
   /**
   * Determines if dBug has been initialized
   * @var  bool
   * @access private
   */
  private $b_initialized = false;
  
  /**
   * true = parent table collapsed
   * @var bool
   * @access private
   */
  private $b_collapsed = false;
  
  /**
   * Stores serialization of variables to check for recursion
   * @var array
   * @access private
   */
  private $a_history = array();
  
  /**
   * Constructor
   *
   * renders JS and CSS scripts once on page
   * Checks type of variable is passed, and if force_type should be applied
   * @param  object   $obj          variable object passed in
   * @param  string   $force_type   type of object
   * @param  boolean  $b_collapsed  true = table_collapsed
   * @return void
   */
  public function __construct($obj, $force_type = "", $b_collapsed = false) {
    // include js and css scripts
    if(!defined('B_DBUGINIT')) {
      define("B_DBUGINIT", TRUE);
      $this->initJSandCSS();
    }

    // array of variable types that can be "forced"
    $a_accept = array("array","object","xml");

    $this->b_collapsed = $b_collapsed;
    if(in_array($force_type, $a_accept))
      $this->{"varIs" . ucfirst($force_type)}($obj);
    else
      $this->checkType($obj);
  }

  /**
   * Get variable name of object passed into class
   * Example: get "my_var" from $my_var
   * 
   * @return  void
   */
  private function getVariableName() {
    // assign vars and do backtrace
    $a_include = array("include", "include_once", "require", "require_once");
    $a_backtrace = debug_backtrace();
    $i_count = count($a_backtrace) - 1;
    // loop through backtrace
    for($i = $i_count; $i >= 0; $i--) {
      $a_current = $a_backtrace[$i];
      
      // find occurrences of calls to "new dBug"
      // check for any included/required files
      // if found, get array of the last included file (they contain the right line numbers)
      if(array_key_exists("function", $a_current) && 
        (in_array($a_current["function"], $a_include) || (0 != strcasecmp($a_current["function"], "dbug"))))
        continue;

      $a_file = $a_current;
      break;
    }
    
    if(isset($a_file)) {
      $a_lines = file($a_file["file"]);
      $code = $a_lines[($a_file["line"] - 1)];
    
      //find call to dBug class
      preg_match('/\bnew dBug\s*\(\s*(.+)\s*\);/i', $code, $a_matches);

      return $a_matches[1];
    }

    return "";
  }
  
  /**
   * Create table header
   *
   * @param   string   $type     type of variable to assign to css class selector
   * @param   string   $header   name of variable to assign to header row
   * @param   integer  $colspan  table column span
   * @return  void
   */
  private function makeTableHeader($type, $header, $colspan = 2) {
    if(!$this->b_initialized) {
      $header = $this->getVariableName() . " (" . $header . ")";
      $this->b_initialized = true;
    }
    $str = ($this->b_collapsed) ? "style=\"font-style:italic\" " : ""; 
    
    echo "<table class=\"dBug_" . $type . " dBug_table\" cellspacing=1>
        <tr>
          <td ".$str."class=\"dBug_header dBug_".$type."Header\" colspan=".$colspan." onClick='dBug_toggleTable(this)'>".$header."</td>
        </tr>
      ";
  }
    
  /**
   * Create table row header
   *
   * @param   string  $type  type of variable to assign to css class selector
   * @param   string  $key   variable key
   * @return  void
   */
  private function makeTDHeader($type, $key) {
    $str = ($this->b_collapsed) ? " style=\"display:none\"" : "";
    echo "<tr" . $str . ">
          <td valign=\"top\" onClick='dBug_toggleRow(this)' class=\"dBug_key dBug_".$type."Key\">".$key."</td>
          <td>";
  }
  

  /**
   * Close table row
   *
   * @return  string
   */
  private function closeTDRow() {
    return "</td></tr>\n";
  }
  
  /**
   * Print out error
   *
   * @param   string  $type  type of variable
   * @return  string
   */
  private function  error($type) {
    $error = "Error: Variable cannot be a";
    // this just checks if the type starts with a vowel or "x" and displays either "a" or "an"
    if(in_array(substr($type,0,1), array("a","e","i","o","u","x")))
      $error.="n";
    return ($error." ".$type." type");
  }

  /**
   * Check variable type and route to appropriate method
   *
   * @param   [any]  $obj  variable to be dumped
   * @return  void
   */
  private function checkType($obj) {
    switch(gettype($obj)) {
      // db resource
      case "resource":
        $this->varIsResource($obj);
        break;
      // object
      case "object":
          $this->varIsObject($obj);
        break;
      // array
      case "array":
        $this->varIsArray($obj);
        break;
      // null
      case "NULL":
        $this->varIsNULL();
        break;
      // boolean
      case "boolean":
        $this->varIsBoolean($obj);
        break;
      // string
      default:
        $obj = ($obj=="") ? "[empty string]" : $obj;
        echo "<table cellspacing=0><tr>\n<td>".$obj."</td>\n</tr>\n</table>\n";
        break;
    }
  }
  
  /**
   * Dump null
   *
   * @return  void
   */
  private function varIsNULL() {
    echo "NULL";
  }
  
  /**
   * Dump boolean
   *
   * @param   bool  $obj  variable to dump
   * @return  void
   */
  private function varIsBoolean($obj) {
    $obj = ($obj==1) ? "TRUE" : "FALSE";
    echo $obj;
  }

  /**
   * Dump array
   *
   * @param   array  $obj  variable to dump
   * @return  void
   */
  private function varIsArray($obj) {
    $obj_ser = serialize($obj);
    array_push($this->a_history, $obj_ser);
    
    $this->makeTableHeader("array", "array");
    if(is_array($obj)) {
      foreach($obj as $key => $value) {
        $this->makeTDHeader("array", $key);
        
        //check for recursion
        if(is_array($value)) {
          $obj_ser = serialize($value);
          if(in_array($obj_ser, $this->a_history, TRUE))
            $value = "*RECURSION*";
        }
        
        if(in_array(gettype($value), $this->a_type))
          $this->checkType($value);
        else {
          $value = (trim($value)=="") ? "[empty string]" : $value;
          echo $value;
        }
        echo $this->closeTDRow();
      }
    }
    else echo "<tr><td>" . $this->error("array") . $this->closeTDRow();
    array_pop($this->a_history);
    echo "</table>";
  }
  
  /**
   * Dump an object
   *
   * @param   object  $obj  variable to dump
   * @return  void
   */
  private function varIsObject($obj) {
    $obj_ser = serialize($obj);
    array_push($this->a_history, $obj_ser);
    $this->makeTableHeader("object","class ".get_class($obj) );
    
    if(is_object($obj)) {
      $a_obj_vars = get_object_vars($obj);
      foreach($a_obj_vars as $key => $value) {

        $value=(!is_object($value) && !is_array($value) && trim($value) == "") ? "[empty string]" : $value;
        $this->makeTDHeader("object", $key);
        
        //check for recursion
        if(is_object($value) || is_array($value)) {
          $obj_ser = serialize($value);
          if(in_array($obj_ser, $this->a_history, TRUE)) {
            $value = (is_object($value)) ? "*RECURSION* -> $" . get_class($value) : "*RECURSION*";

          }
        }
        if(in_array(gettype($value), $this->a_type))
          $this->checkType($value);
        else echo $value;
        echo $this->closeTDRow();
      }
      $a_obj_methods = get_class_methods(get_class($obj));
      foreach($a_obj_methods as $key => $value) {
        $this->makeTDHeader("object", $value);
        echo "[function]" . $this->closeTDRow();
      }
    }
    else echo "<tr><td>" . $this->error("object") . $this->closeTDRow();
    array_pop($this->a_history);
    echo "</table>";
  }

  /**
   * Dump resouce
   *
   * @param   resource  $obj  variable to dump
   * @return  void
   */
  private function varIsResource($obj) {
    $this->makeTableHeader("resourceC", "resource", 1);
    echo "<tr>\n<td>\n";
    switch(get_resource_type($obj)) {
      case "fbsql result":
      case "mssql result":
      case "msql query":
      case "pgsql result":
      case "sybase-db result":
      case "sybase-ct result":
      case "mysql result":
        $db = current(explode(" ", get_resource_type($obj)));
        $this->varIsDBResource($obj, $db);
        break;
      case "gd":
        $this->varIsGDResource($obj);
        break;
      case "xml":
        $this->varIsXmlResource($obj);
        break;
      default:
        echo get_resource_type($obj) . $this->closeTDRow();
        break;
    }
    echo $this->closeTDRow() . "</table>\n";
  }

  /**
   * Dump database resource
   *
   * @param   db_resource  $obj  variable to dump
   * @param   string  $db   database type
   * @return  void
   */
  private function varIsDBResource($obj, $db = "mysql") {
    if($db == "pgsql")
      $db = "pg";
    if($db == "sybase-db" || $db == "sybase-ct")
      $db = "sybase";
    $a_fields = array("name","type","flags");  
    $numrows = call_user_func($db."_num_rows", $obj);
    $numfields = call_user_func($db."_num_fields", $obj);
    $this->makeTableHeader("resource",$db." result", $numfields + 1);
    echo "<tr><td class=\"dBug_resourceKey\">&nbsp;</td>";
    for($i = 0; $i < $numfields; $i++) {
      $field_header = "";
      for($j = 0; $j < count($a_fields); $j++) {
        $db_func = $db . "_field_" . $a_fields[$j];
        if(function_exists($db_func)) {
          $fheader = call_user_func($db_func, $obj, $i) . " ";
          if($j == 0)
            $field_name = $fheader;
          else
            $field_header .= $fheader;
        }
      }
      $field[$i] = call_user_func($db . "_fetch_field", $obj, $i);
      echo "<td class=\"dBug_resourceKey\" title=\"" . $field_header . "\">" . $field_name . "</td>";
    }
    echo "</tr>";
    for($i = 0; $i < $numrows; $i++) {
      $row = call_user_func($db . "_fetch_array", $obj, constant(strtoupper($db) . "_ASSOC"));
      echo "<tr>\n";
      echo "<td class=\"dBug_resourceKey\">" . ($i + 1) . "</td>"; 
      for($k = 0; $k < $numfields; $k++) {
        $tempField = $field[$k]->name;
        $fieldrow = $row[($field[$k]->name)];
        $fieldrow = ($fieldrow == "") ? "[empty string]" : $fieldrow;
        echo "<td>" . $fieldrow . "</td>\n";
      }
      echo "</tr>\n";
    }
    echo "</table>";
    if($numrows > 0)
      call_user_func($db . "_data_seek", $obj, 0);
  }
  
  /**
   * Dump image/GD resource
   *
   * @param   gd_resource  $obj  variable to dump
   * @return  void
   */
  private function varIsGDResource($obj) {
    $this->makeTableHeader("resource", "gd", 2);
    $this->makeTDHeader("resource", "Width");
    echo imagesx($obj) . $this->closeTDRow();
    $this->makeTDHeader("resource", "Height");
    echo imagesy($obj) . $this->closeTDRow();
    $this->makeTDHeader("resource", "Colors");
    echo imagecolorstotal($obj) . $this->closeTDRow();
    echo "</table>";
  }
  
  /**
   * Pass on to XML resource
   * necessary so force_type can be simply passed in as 'xml'
   *   
   * @param   string  $obj  variable to dump
   * @return  void
   */
  private function varIsXml($obj) {
    $this->varIsXmlResource($obj);
  }
  
  /**
   * Dump XML resource
   *
   * @param   sstring  $obj  variable to dump
   * @return  void
   */
  function varIsXmlResource($obj) {
    $xml_parser = xml_parser_create();
    xml_parser_set_option($xml_parser, XML_OPTION_CASE_FOLDING, 0); 
    xml_set_element_handler($xml_parser, array(&$this, "xmlStartElement"), array(&$this, "xmlEndElement")); 
    xml_set_character_data_handler($xml_parser, array(&$this, "xmlCharacterData"));
    xml_set_default_handler($xml_parser, array(&$this, "xmlDefaultHandler"));
    
    $this->makeTableHeader("xml", "xml document", 2);
    $this->makeTDHeader("xml","xmlRoot");
    
    //attempt to open xml file
    $bFile = (!($fp = @fopen($obj, "r"))) ? false : true;
    
    //read xml file
    if($bFile) {
      while($data = str_replace("\n", "", fread($fp, 4096)))
        $this->xmlParse($xml_parser, $data, feof($fp));
    }
    //if not a file, attempt to read it as a string
    else {
      if(!is_string($obj)) {
        echo $this->error("xml") . $this->closeTDRow() . "</table>\n";
        return;
      }
      $data = $obj;
      $this->xmlParse($xml_parser, $data, 1);
    }
    
    echo $this->closeTDRow() . "</table>\n";
    
  }
  
  /**
   * Parse XML
   *
   * @param   resource  $xml_parser  XML parser reference
   * @param   string  $data        XML data
   * @param   bool  $b_final     true = data is last piece
   * @return  void
   */
  private function xmlParse($xml_parser, $data, $b_final) {
    if (!xml_parse($xml_parser, $data, $b_final)) { 
           die(sprintf("XML error: %s at line %d\n", 
                 xml_error_string(xml_get_error_code($xml_parser)), 
                 xml_get_current_line_number($xml_parser)));
    }
  }
  
  /**
   * When start XML tags are found, start XML table header
   *
   * @param   resource  $parser     XML parser
   * @param   array  $a_name     description
   * @param   array  $a_attribs  [description]
   * @return  void
   */
  private function xmlStartElement($parser, $a_name, $a_attribs) {
    $this->xml_attrib[$this->xml_count] = $a_attribs;
    $this->xml_name[$this->xml_count] = $a_name;

    $this->xml_s_data[$this->xml_count] =  '$this->makeTableHeader("xml","xml element", 2);';
    $this->xml_s_data[$this->xml_count] .= '$this->makeTDHeader("xml","xml_name");';
    $this->xml_s_data[$this->xml_count] .= 'echo "<strong>' . $this->xml_name[$this->xml_count] . '</strong>".$this->closeTDRow();';
    $this->xml_s_data[$this->xml_count] .= '$this->makeTDHeader("xml","xml_attributes");';
    if(count($a_attribs)>0)
      $this->xml_s_data[$this->xml_count] .= '$this->varIsArray($this->xml_attrib[' . $this->xml_count . ']);';
    else
      $this->xml_s_data[$this->xml_count] .= 'echo "&nbsp;";';
    $this->xml_s_data[$this->xml_count] .= 'echo $this->closeTDRow();';
    $this->xml_count++;
  }

  /**
   * When end XML tags are found, close table row and table
   *
   * @param   resource  $parser  XML parser
   * @return  void
   */
  private function xmlEndElement($parser) {
    for($i = 0; $i < $this->xml_count; $i++) {
      eval($this->xml_s_data[$i]);
      $this->makeTDHeader("xml","xmlText");
      echo (!empty($this->xml_c_data[$i])) ? $this->xml_c_data[$i] : "&nbsp;";
      echo $this->closeTDRow();
      $this->makeTDHeader("xml","xmlComment");
      echo (!empty($this->xml_d_data[$i])) ? $this->xml_d_data[$i] : "&nbsp;";
      echo $this->closeTDRow();
      $this->makeTDHeader("xml","xmlChildren");
      unset($this->xml_c_data[$i], $this->xml_d_data[$i]);
    }
    echo $this->closeTDRow();
    echo "</table>";
    $this->xml_count = 0;
  }

  /**
   * Print text between XML tags
   *
   * @param   resource  $parser  XML parser
   * @param   string  $data    text between tags
   * @return  void
   */
  private function xmlCharacterData($parser, $data) {
    $count = $this->xml_count - 1;
    if(!empty($this->xml_c_data[$count]))
      $this->xml_c_data[$count] .= $data;
    else
      $this->xml_c_data[$count] = $data;
  }
  
  /**
   * Print XML comments or other text
   *
   * @param   resource  $parser  XML parser
   * @param   string  $data    text comment
   * @return  void
   */
  private function xmlDefaultHandler($parser, $data) {
    //strip '<!--' and '-->'
    $data = str_replace(array("&lt;!--", "--&gt;"), "", htmlspecialchars($data));
    $count = $this->xml_count - 1;
    if(!empty($this->xml_d_data[$count]))
      $this->xml_d_data[$count] .= $data;
    else
      $this->xml_d_data[$count] = $data;
  }

  /**
   * Output Javascript and stylesheet
   *
   * @return  void
   */
  private function initJSandCSS() {
    echo <<<SCRIPTS
      <script language="JavaScript">
      /* code modified from ColdFusion's cfdump code */
        function dBug_toggleRow(source) {
          var target = (document.all) ? source.parentElement.cells[1] : source.parentNode.lastChild;
          dBug_toggleTarget(target,dBug_toggleSource(source));
        }
        
        function dBug_toggleSource(source) {
          if (source.style.fontStyle=='italic') {
            source.style.fontStyle='normal';
            source.title='click to collapse';
            return 'open';
          } else {
            source.style.fontStyle='italic';
            source.title='click to expand';
            return 'closed';
          }
        }
      
        function dBug_toggleTarget(target,switchToState) {
          target.style.display = (switchToState=='open') ? '' : 'none';
        }
      
        function dBug_toggleTable(source) {
          var switchToState=dBug_toggleSource(source);
          if(document.all) {
            var table=source.parentElement.parentElement;
            for(var i=1;i<table.rows.length;i++) {
              target=table.rows[i];
              dBug_toggleTarget(target,switchToState);
            }
          }
          else {
            var table=source.parentNode.parentNode;
            for (var i=1;i<table.childNodes.length;i++) {
              target=table.childNodes[i];
              if(target.style) {
                dBug_toggleTarget(target,switchToState);
              }
            }
          }
        }
      </script>
      
      <style type="text/css">
        .dBug_table { font: normal 12px Verdana, Arial, Helvetica, sans-serif; }
        .dBug_table td { padding: 5px; background-color: #fff; }
        .dBug_header { font-weight:bold; color:#fff; cursor:pointer; }
        .dBug_key { cursor:pointer; }
          
        /* array */
        table.dBug_array { background-color:#0b6d22; }
        table.dBug_array td.dBug_arrayHeader { background-color:#2abf4d; }
        table.dBug_array td.dBug_arrayKey { background-color:#c5f4d0; }

        /* object */
        table.dBug_object { background-color:#0000CC; }
        table.dBug_object td.dBug_objectHeader { background-color:#345add; }
        table.dBug_object td.dBug_objectKey { background-color:#CCDDFF; }

        /* resource */
        table.dBug_resourceC { background-color:#884488; }
        table.dBug_resourceC td.dBug_resourceCHeader { background-color:#AA66AA; }
        table.dBug_resourceC td.dBug_resourceCKey { background-color:#FFDDFF; }

        /* resource */
        table.dBug_resource { background-color:#884488; }
        table.dBug_resource td.dBug_resourceHeader { background-color:#AA66AA; }
        table.dBug_resource td.dBug_resourceKey { background-color:#FFDDFF; }

        /* xml */
        table.dBug_xml { background-color:#888888; }
        table.dBug_xml td.dBug_xmlHeader { background-color:#AAAAAA; }
        table.dBug_xml td.dBug_xmlKey { background-color:#DDDDDD; }
      </style>

SCRIPTS;
  }

}
?>