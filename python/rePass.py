# nuke script to assign customized names to 3d multi-pass channels from Cinema4D
# also has ability to remove, rename, add channels to make the nuke workflow easier

import nuke
import nukescripts

class ShapePanel(nukescripts.PythonPanel):
    def __init__(self, node):
        nukescripts.PythonPanel.__init__(self, 'Assign Passes')
        self.rpNode = node
        
        channels = node.channels()
        channels.sort()
        layers = list( set([c.split('.')[0] for c in channels]) )
        layers.sort()
        
        self.var = {}
        self.layers = {}
        tmp = {}
        tmp_layers = []
        cols = ['mp_remove', 'mp_layer', 'mp_layernew']
        counter = 0

        for index, item in enumerate(channels):
            s_layer = item.split('.')[0]
            s_channel = item.split('.')[1]
            if s_layer not in self.layers:
                self.layers[s_layer] = []

                bul = str(counter + 1)
                num = str(counter)

                for i in cols:
                    tmp[i] = i + num

                tmp['mp_remove'] = nuke.Boolean_Knob (tmp['mp_remove'], 'remove?', 0)
                tmp['mp_remove'].setTooltip('Remove current layer?')
                tmp['mp_remove'].setFlag(nuke.STARTLINE)
                tmp['mp_layer'] = nuke.Enumeration_Knob(tmp['mp_layer'], '', layers)
                tmp['mp_layer'].setValue(s_layer)
                tmp['mp_layer'].clearFlag(nuke.STARTLINE)
                tmp['mp_layernew'] = nuke.String_Knob (tmp['mp_layernew'], '=>', '')
                tmp['mp_layernew'].setTooltip('Type new layer name. You can add a new channel by typing "layer.channel_name". \nNote: Only 1 channel may be added!')
                tmp['mp_layernew'].clearFlag(nuke.STARTLINE)
                
                for k in cols:
                    self.var[k+num] = tmp[k]
                    self.addKnob(tmp[k])

                counter += 1

            self.layers[s_layer].append(s_channel)

        self.addKnob(nuke.Text_Knob('_','',''))


# remove nodes 
def removeNodes( node, layers, title ):
    ''' create remove node to clear layer '''
    remNode = nuke.nodes.Remove( label = title, inputs = [node] )
    for i, item in enumerate(layers):
        j = str(i + 1)
        if i == 0:
            j = ''
        tmp_channel = 'channels' + j
        remNode[tmp_channel].setValue ( item )
    return remNode


# copy nodes
def copyNodes(node, layers, title):
    copyNode = nuke.nodes.Copy (label=title, inputs = [node, node])
    for i, item in enumerate(layers):
        # create layer and channel
        layer = item['to'].split('.')[0]
        # channels = item['to'].split('.')[1]
        # nuke.Layer(layer, [item['to']])
        # copy node
        copyNode['from'+str(i)].setValue(item['from'])
        copyNode['to'+str(i)].setValue(item['to'])

    return copyNode

def rePass():
    node = nuke.selectedNode()
    p = ShapePanel(node)
    v = { 'ol': { 'shuffle':{}, 'copy':[], 'curr_channel_index':{}, 'remove':[] } }
    order = ['red','green','blue','alpha']

    if p.showModalDialog(): #show dialog
        
        k=0
        # loop through all rows
        while k < len(p.layers):
            j = str(k)
            tmp_layer = p.var['mp_layer'+j].value()
            tmp_layer_new = p.var['mp_layernew'+j].value()
            tmp_remove = p.var['mp_remove'+j].value()

            # add to copy list
            if tmp_layer_new:
                a_layer = tmp_layer_new.strip().split('.')
                if tmp_layer not in v['ol']['curr_channel_index']:
                    v['ol']['curr_channel_index'][tmp_layer] = 0
                curr_index = v['ol']['curr_channel_index'][tmp_layer]

                if len(a_layer) > 1:
                    s_from = tmp_layer + '.' + p.layers[tmp_layer][curr_index]
                    s_to = tmp_layer_new
                    nuke.Layer(a_layer[0], [s_to])
                    v['ol']['copy'].append({'from': s_from, 'to': s_to})
                    v['ol']['curr_channel_index'][tmp_layer] += 1
                else:
                    a_tmp_layers_new = []
                    a_tmp_channels = []
                    for channel in p.layers[tmp_layer]:
                        s_from = tmp_layer + '.' + channel
                        s_to = tmp_layer_new + '.' + channel
                        a_tmp_layers_new.append(s_to)
                        a_tmp_channels.append(channel)
                        v['ol']['copy'].append({'from': s_from, 'to': s_to})
                        v['ol']['curr_channel_index'][tmp_layer] += 1

                    if (False not in [ e in order for e in a_tmp_channels ]):
                        # sort channel order to ['red','green','blue','alpha']
                        a_tmp_layers_new.sort(key=lambda L: order.index(L.split('.')[1]))
                    # create new layer and its channels
                    nuke.Layer(tmp_layer_new, a_tmp_layers_new)


            # add to remove list
            if tmp_remove and tmp_layer not in v['ol']['remove']:
                if tmp_layer != 'rgba':
                    v['ol']['remove'].append(tmp_layer)

            k += 1


        # copy layers
        while len(v['ol']['copy']) > 0:
            tmp_layers = []
            s_range = 4 if len(v['ol']['copy']) > 4 else len(v['ol']['copy'])
            for i in range(s_range):
                tmp_layers.append(v['ol']['copy'][0])
                v['ol']['copy'].pop(0)
            node = copyNodes(node, tmp_layers, 'Copy Node')


        # remove layers
        k = 0
        counter = 0
        tmp_layers = []
        while k < len(v['ol']['remove']):
            counter += 1
            tmp_layers.append(v['ol']['remove'][k])
            k += 1
            if counter == 4 or k >= len(v['ol']['remove']):
                counter = 0
                node = removeNodes(node, tmp_layers, 'Remove Layers')
                tmp_layers = []
