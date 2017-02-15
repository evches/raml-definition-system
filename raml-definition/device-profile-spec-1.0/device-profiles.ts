import  MetaModel = require("../metamodel")
import  Sys = require("./systemTypes")
//import  Bodies=require("./bodies")
//import Common = require("./common")
//import  Declarations=require("./declarations")

/*export class InputParamChoices_JinjaTemplate {
  input_param: string
  $input_param = [
    MetaModel.description(
      "Jinja template to construct the input parameters to the config template.\
       This jinja template is rendered with defined resources as the input parameter."
     )]
}

export class InputParamChoices_CopyInputParam {
  copy_input_param_from: string // TODO convert to UUID
  $copy_input_param_from = [ MetaModel.description("copy the input param from a sibling config template") ]
}*/

export class ConfigTemplate {
  name: string
  $name = [
    MetaModel.key(),
    MetaModel.description("Config name")
  ]

  display_name: string
  $display_name = [
    MetaModel.description("Display name in the UI for this template")
  ]

  hide: boolean
  $hide = [
    MetaModel.defaultBooleanValue(false),
    MetaModel.description("Do not show this template in the UI")
  ]

  device_component_name: string
  $device_component_name = [
    MetaModel.required(),
    MetaModel.description("device component name such as 'JDM', 'JCP', or 'gw-router'")
  ]

  template_uuid: string // TODO: introduce UUID type as a regexp-limited string
  $template_uuid = [
    MetaModel.required(),
    MetaModel.description("UUID of the config template")
  ]
  // TODO: somehow extend input_param_choices union from above
}

export class DeviceProfileOutput {
  $=[ MetaModel.description("grouping device-profile-output") ]

  resources: string[]
  $resources = [ MetaModel.description("list of resources to return after they gets resolved") ]

  config_templates: ConfigTemplate[]
  $config_templates = [ MetaModel.description("List of config templates used in the workflow") ]
}

/*export class StrValue {
  str_value: string
  $str_value = [ MetaModel.description("String valued parameter") ]
}

export class NumValue {
  num_value: number
  $num_value = [ MetaModel.description("Integer valued parameter") ]
}

export class BoolValue {
  bool_value: boolean
  $bool_value = [ MetaModel.description("Boolean parameter") ]
}

export class ObjValue {
  obj_value: any
  $obj_value = [ MetaModel.description("JSON parameter") ]
}*/

export class ParamValue {
  // TODO: make this a union of *Value classes above once we support unions
  str_value: string
  num_value: number
  bool_value: boolean
  obj_value: any
}

export class GlobalParameter {
  $ = [ MetaModel.description("Global customizable parameters that can be used in all workflows") ]

  name: string
  $name = [ MetaModel.description("Parameter name") ]

  description: string
  $description = [ MetaModel.description("Description for this parameter") ]

  value: ParamValue
}

export class Parameter {
  $ = [ MetaModel.description("Input parameters to resolve the resources defined in this workflow") ]

  name: string
  $name = [ MetaModel.description("Parameter name") ]

  description: string
  $description = [ MetaModel.description("Description for this parameter") ]

  type: string
  $type = [
    MetaModel.oneOf(["STR", "NUM", "OBJ"]),
    MetaModel.description("parameter type")
  ]

  default_value: string
  $default_value = [ MetaModel.description("Default value for this parameter") ]
}

export class RestApi {
  $ = [ MetaModel.description(
    `REST API info that can be used to construct resource
     object. The returned JSON from the API call is assigned
     to this resource.`) ]

  service_name: string
  $service_name = [ MetaModel.description(
    `Jinja template to construct the Service name that can be used
     for service discovery, such as 'local.csp-dms-central',
     '{{region_name}}.csp-dms-regional'`) ]

  method: string
  $method = [ MetaModel.oneOf(["GET", "POST"]), MetaModel.description("REST methods") ]

  uri: string
  $uri = [ MetaModel.description("Jinja template to construct URI for the REST API") ]

  http_body: string
  $http_body = [ MetaModel.description(
    `Jinja template that can be used to construct the HTTP body
     for the REST API call. The input parameter for this jinja
     template are parameters defined in the workflow parameters
     or other resources defined in this workflow`) ]
}

export class Resource {
  $ = [ MetaModel.description("List of resource objects that can be defined or constructed via REST API") ]

  resource_name: string
  $resource_name = [ MetaModel.description(
    `Resource name has to be a valid python variable name. This
     is because the resources are used as the jinja input parameters`) ]

  input_resources: string[]
  $input_resources = [ MetaModel.description(
    `List of resources defined in this workflow that are served as input
     to resolve this resource. The input resources needs to be resolved
     first before this resource can be resolved. There should not be
     circular dependency between the resources defined in the same
     workflow. This chained resource resolution allows someone to resolve
     resource by traversing the CSP topology. For example, one can get
     tenant by a uCPE device id by creating following resource chain:
     dev_uuid => device node in the topology => site node in the topology
     => tenant in the topology`) ]

  rest_api: RestApi

  json_value: string
  $json_value = [ MetaModel.description("Jinja template that can be used to construct the resource object from the workflow parameters") ]
}

export class Workflow {
  $ = [ MetaModel.description(
    `Workflow input data that are used by workflow implementations to
     customerize the workflow with input resources and config templates.`) ]

  workflow_name: string
  $workflow_name = [ MetaModel.description(
    `Name of the workflow that can used by workflow implementation to
     look up the specific workflow input data defined in this device
     profile.`) ]

  parameters: Parameter[]

  resources: Resource[]

  output: DeviceProfileOutput
}

export class DeviceProfileBase {
  $ = [MetaModel.description(
        `Mechanism to inherit from a parent profile. You can define a
        device-profile to inherit from a single other parent profile.
        1. All workflows are inherited from the parent profile.
        2. You can exclude a set of workflows from being inherited by
        specifying their names in the excluded_workflows list.
        3. You can redefine any of the inherited workflows by specifying
        their names in the redefined_workflows list.
        4. When redefining a workflow, you must follow the following rules:
           A) Leave the parameters list empty. It will be the same as the
           parameter list from the workflow in the parent profile.
           B) All resources from the workflow in the parent inheritance chain
           will be available in the redefined workflow.
           C) You can add resources with new names - i.e. names not conflicting
           with any other resource for the same workflow in the parent
           inheritance chain.
           D) You can redefine a resource - i.e. define a resource with the
           same name in this workflow and provide a body. In this case the
           workflow in the sub-profile must provide the complete resource
           definition.
           E) You must define the output of the workflow completely in the
           sub-profile. It is not inherited from the parent workflow.
        5. You can add any number of new workflows into the sub-profile.`
  )]

  parent_profile: string
  $parent_profile = [ MetaModel.description("Name of the device-profile which is being inherited") ]

  excluded_workflows: string[]
  $excluded_workflows = [ MetaModel.description("List of workflows that are not inherited from this parent profile") ]

  redefined_workflows: string[]
  $redefined_workflows = [ MetaModel.description("List of workflows that are being redefined in this sub-profile") ]

  global_parameters: GlobalParameter[]
  //$=[MetaModel.description()]

  workflows: Workflow[]
}
