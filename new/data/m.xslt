<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:mei="http://www.music-encoding.org/ns/mei"
    exclude-result-prefixes="xs"
    version="2.0">
    <xsl:template match="element()">
        <xsl:copy>
            <xsl:apply-templates select="@*,node()"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="attribute()|text()|comment()|processing-instruction()">
        <xsl:copy/>
    </xsl:template>
    
    <xsl:template match="mei:section/mei:measure[1]">
        <measure xmlns="http://www.music-encoding.org/ns/mei">
            <xsl:apply-templates select="@*|node()"/>
            <!--<xsl:for-each select="">
                
            </xsl:for-each>-->
        </measure>
    </xsl:template>
    
    <xsl:template match="mei:section/mei:measure[1]/mei:staff">
        <staff xmlns="http://www.music-encoding.org/ns/mei">
            <xsl:apply-templates select="@*|node()"/>
        </staff>
    </xsl:template>
    
    <xsl:template match="mei:section/mei:measure[1]/mei:staff/mei:layer">
        <layer xmlns="http://www.music-encoding.org/ns/mei">
            <xsl:apply-templates select="@*"/>
            
            <xsl:sequence select="//mei:layer[@n=current()/@n]/node()"/>
            
        </layer>
    </xsl:template>
    
    <xsl:template match="mei:section/mei:measure[not(position()=1)]"/>        
    
</xsl:stylesheet>